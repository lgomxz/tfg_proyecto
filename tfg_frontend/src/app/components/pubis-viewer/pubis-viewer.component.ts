import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  SimpleChanges,
  OnChanges,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { CarouselComponent } from '../../components/carousel/carousel.component';
import { ViewerComponent } from '../../components/viewer/viewer.component';
import { MatButtonModule } from '@angular/material/button';
import { ToastService } from '../../components/toast/toast.service';
import { MessageService } from 'primeng/api';
import { ToastType } from '../../components/toast/toast';
import { InputTextModule } from 'primeng/inputtext';
import { FormComponent } from '../../components/form/form.component';
import {
  FormInputWidth,
  FormInputType,
  CollectionFormConfig,
} from '../../components/form/form';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { ActivatedRoute, Router } from '@angular/router';
import { PubisService } from '../../services/pubis.service';
import { Pubis } from '../../models/pubis';
import { FilesByModelType, MyFile } from '../../models/file';
import {
  AtlasConfig,
  atlasConfig,
  AtlasConfigInfo,
} from '../../../config/atlas_config';
import { MatIconModule } from '@angular/material/icon';
import { LabellingService } from '../../services/labelling.service';
import { AuthService } from '../../services/auth.service';
import { switchMap } from 'rxjs';
import { UserApiService } from '../../services/user-api.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { RolesApiService } from '../../services/roles-api.service';
import { Label } from '../../models/label';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@UntilDestroy()
@Component({
  selector: 'app-pubis-viewer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextareaModule,
    ButtonModule,
    MatIconModule,
    CarouselComponent,
    ViewerComponent,
    MatButtonModule,
    InputTextModule,
    FormComponent,
    TabViewModule,
    TooltipModule,
    TranslateModule,
  ],
  providers: [MessageService],
  templateUrl: './pubis-viewer.component.html',
  styleUrls: ['./pubis-viewer.component.scss'],
})
export class PubisViewerComponent implements OnInit, OnChanges {
  @Input() shortId?: string;
  @Input() label?: Label;

  showAtlasButton: boolean = true;
  currentMode: 'training' | 'labelling' | 'single-sample' | 'multiple-samples' =
    'labelling';
  form!: FormGroup;
  bones_imgs: MyFile[] = [];
  model!: MyFile;
  pubisObj: Pubis | null = null;
  showErrorMessage: boolean = false;
  showFeedback: boolean = false;
  labelModes: Record<string, string[]> = {};
  comparisonResults: { [key: string]: 'correct' | 'incorrect' } = {};
  formSubmitted: boolean = false;
  toggleCarouselViewer: boolean = false;
  showScoreModal: boolean = false;
  score: number = 0;
  atlas: AtlasConfig[] = atlasConfig;
  atlastToShow: AtlasConfigInfo[] = [];
  atlasOpened: boolean = false;
  showAtlas: boolean = false;
  files: FilesByModelType[] | undefined;
  formConfig: CollectionFormConfig[] = [];

  constructor(
    private toastService: ToastService,
    private activatedRoute: ActivatedRoute,
    private pubisService: PubisService,
    private labelService: LabellingService,
    private authService: AuthService,
    private userService: UserApiService,
    private rolesService: RolesApiService,
    private router: Router,
    private cdRef: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.updateFormConfig();

    const url = this.router.url;
    if (url.includes('training-tool')) {
      this.currentMode = 'training';
    } else if (url.includes('single-sample')) {
      this.currentMode = 'single-sample';
    } else if (url.includes('multiple-samples')) {
      this.currentMode = 'multiple-samples';
    } else {
      this.currentMode = 'labelling';
    }

    // Espera a que las traducciones estén listas
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateFormConfig();
      this.cdRef.detectChanges();
    });

    this.authService.isLoggedIn
      .pipe(untilDestroyed(this))
      .subscribe(isLoggedIn => {
        if (isLoggedIn) {
          this.authService
            .getUserEmail()
            .pipe(untilDestroyed(this))
            .subscribe({
              next: email => {
                if (email) {
                  this.userService
                    .getRoleIdByEmail(email)
                    .pipe(untilDestroyed(this))
                    .subscribe({
                      next: response => {
                        const roleId = response.roleId;

                        this.rolesService
                          .getRoleById(roleId)
                          .pipe(untilDestroyed(this))
                          .subscribe({
                            next: role => {
                              if (role.name.toLowerCase() === 'admin') {
                                this.showAtlasButton = false;
                              }
                              if (this.currentMode === 'single-sample') {
                                this.showAtlasButton = false;
                              }

                              // Esperar a que el idioma esté cargado antes de inicializar el formulario
                              this.translate
                                .get('PUBIS')
                                .pipe(untilDestroyed(this))
                                .subscribe(() => {
                                  const controls: any = {};
                                  this.formConfig.forEach(group => {
                                    group.child.forEach(field => {
                                      const validators = field.mandatory
                                        ? [Validators.required]
                                        : [];
                                      const control = new FormControl(
                                        field.value || null,
                                        validators
                                      );
                                      if (field.readOnly) control.disable();
                                      controls[field.apiField] = control;
                                    });
                                  });
                                  this.form = new FormGroup(controls);
                                });
                            },
                            error: err =>
                              console.error('Error al obtener el rol:', err),
                          });
                      },
                      error: err =>
                        console.error('Error al obtener roleId:', err),
                    });
                }
              },
              error: () => console.error('Error al obtener el email'),
            });
        }
      });

    // Carga datos según el modo
    if (this.currentMode === 'labelling') {
      this.activatedRoute.queryParamMap.subscribe(params => {
        const shortId = params.get('shortId');
        if (shortId) this.loadPubisData(shortId);
      });
    } else if (
      ['training', 'single-sample', 'multiple-samples'].includes(
        this.currentMode
      )
    ) {
      const shortId =
        this.currentMode === 'training'
          ? this.pubisService
              .getRandomLabeledPubis()
              .subscribe(
                pubis => pubis.shortId && this.loadPubisData(pubis.shortId)
              )
          : this.shortId && this.loadPubisData(this.shortId);

      if (!shortId) console.error('No existe el shortId');
    }

    if (this.currentMode === 'training') {
      this.formConfig = this.formConfig.filter(
        group => group.groupName !== 'Observations'
      );
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.label || !this.shortId) {
      console.warn('Esperando datos válidos: label o shortId faltan');
      return;
    }
    if (this.shortId && changes['shortId']) {
      this.loadPubisData(this.shortId);
    }
    if ((changes['label'] || changes['shortId']) && this.label !== undefined) {
      this.updateFormConfig();

      const controls: any = {};
      this.formConfig.forEach(group => {
        group.child.forEach(field => {
          const validators = field.mandatory ? [Validators.required] : [];
          // Usamos el valor actualizado de label (o null si no hay)
          const key = field.apiField as keyof Label;
          const value = this.label?.[key] ?? null;
          const control = new FormControl(value || null, validators);
          if (field.readOnly) {
            control.disable();
          }
          controls[field.apiField] = control;
        });
      });

      this.form = new FormGroup(controls);

      // Forzar detección de cambios para actualizar la vista
      this.cdRef.detectChanges();
    }
  }

  updateFormConfig() {
    this.translate.get('PUBIS').subscribe((translations: any) => {
      this.formConfig = [
        {
          groupName: translations['AURICULAR_FACE'],
          child: [
            {
              id: 'ArticularFace',
              mandatory: true,
              label: translations['RIDGES_AND_GROOVES'],
              apiField: 'auricular_face_ridges_and_grooves',
              type: FormInputType.SELECT,
              width: FormInputWidth.L,
              values: [
                { code: 'null', description: '-' },
                {
                  code: 'RegularPorosity',
                  description: translations['REGULAR_POROSITY'],
                },
                {
                  code: 'RidgesAndGrooves',
                  description: translations['RIDGES_AND_GROOVES'],
                },
                {
                  code: 'GroovesShallow',
                  description: translations['GROOVES_SHALLOW'],
                },
                {
                  code: 'GroovesRest',
                  description: translations['GROOVES_REMAINS'],
                },
                { code: 'NoGrooves', description: translations['NO_GROOVES'] },
              ],
              value:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples'
                  ? this.label?.auricular_face_ridges_and_grooves
                  : null,
              readOnly:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples'
                  ? true
                  : false,
              showAtlasButton: this.showAtlasButton,
            },
            {
              id: 'IrregularPorosity',
              mandatory: true,
              label: translations['IRREGULAR_POROSITY'],
              apiField: 'auricular_face_irregular_pososity',
              type: FormInputType.SELECT,
              width: FormInputWidth.L,
              values: [
                { code: 'null', description: '-' },
                { code: 'Absence', description: translations['ABSENCE'] },
                { code: 'Medium', description: translations['MEDIUM'] },
                { code: 'Much', description: translations['MUCH'] },
              ],
              showAtlasButton: this.showAtlasButton,
              value:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples'
                  ? this.label?.auricular_face_irregular_pososity
                  : null,
              readOnly:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples'
                  ? true
                  : false,
            },
          ],
        },
        {
          groupName: translations['UPPER_SYMPHYSIAL_EXTREMITY'],
          child: [
            {
              id: 'UpperSymphysialExtremity',
              mandatory: true,
              label: translations['DEFINITION'],
              apiField: 'upper_symphyseal_extremity_definition',
              type: FormInputType.SELECT,
              width: FormInputWidth.L,
              values: [
                { code: 'null', description: '-' },
                {
                  code: 'NotDefined',
                  description: translations['NOT_DEFINED'],
                },
                { code: 'Defined', description: translations['DEFINED'] },
              ],
              showAtlasButton: this.showAtlasButton,
              value:
                this.currentMode === 'single-sample'
                  ? this.label?.upper_symphyseal_extremity_definition
                  : null,
              readOnly: this.currentMode === 'single-sample',
            },
            {
              id: 'BonyNodule',
              mandatory: true,
              label: translations['BONY_NODULE'],
              apiField: 'upper_symphyseal_extremity_bony_nodule',
              type: FormInputType.SELECT,
              width: FormInputWidth.L,
              values: [
                { code: 'null', description: '-' },
                { code: 'Absent', description: translations['ABSENT'] },
                { code: 'Present', description: translations['PRESENT'] },
              ],
              showAtlasButton: this.showAtlasButton,
              value:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples'
                  ? this.label?.upper_symphyseal_extremity_bony_nodule
                  : null,
              readOnly:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples',
            },
          ],
        },
        {
          groupName: translations['LOWER_SYMPHYSIAL_EXTREMITY'],
          child: [
            {
              id: 'LowerSymphysialExtremity',
              mandatory: true,
              label: translations['DEFINITION'],
              apiField: 'lower_symphyseal_extremity_definition',
              type: FormInputType.SELECT,
              width: FormInputWidth.FULL,
              values: [
                { code: 'null', description: '-' },
                {
                  code: 'NotDefined',
                  description: translations['NOT_DEFINED'],
                },
                { code: 'Defined', description: translations['DEFINED'] },
              ],
              showAtlasButton: this.showAtlasButton,
              value:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples'
                  ? this.label?.lower_symphyseal_extremity_definition
                  : null,
              readOnly:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples',
            },
          ],
        },
        {
          groupName: translations['DORSAL_GROOVE'],
          child: [
            {
              id: 'DorsalMargin',
              mandatory: true,
              label: translations['DEFINITION'],
              apiField: 'dorsal_groove_definition',
              type: FormInputType.SELECT,
              width: FormInputWidth.L,
              values: [
                { code: 'null', description: '-' },
                { code: 'Absent', description: translations['ABSENT'] },
                { code: 'Present', description: translations['PRESENT'] },
                { code: 'Closed', description: translations['CLOSED'] },
              ],
              showAtlasButton: this.showAtlasButton,
              value:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples'
                  ? this.label?.dorsal_groove_definition
                  : null,
              readOnly:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples',
            },
            {
              id: 'DorsalPlaeau',
              mandatory: true,
              label: translations['DORSAL_PLATEAU'],
              apiField: 'dorsal_groove_dorsal_plateau',
              type: FormInputType.SELECT,
              width: FormInputWidth.L,
              values: [
                { code: 'null', description: '-' },
                { code: 'Absent', description: translations['ABSENT'] },
                { code: 'Present', description: translations['PRESENT'] },
              ],
              showAtlasButton: this.showAtlasButton,
              value:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples'
                  ? this.label?.dorsal_groove_dorsal_plateau
                  : null,
              readOnly:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples',
            },
          ],
        },
        {
          groupName: translations['VENTRAL_MARGIN'],
          child: [
            {
              id: 'VentralBevel',
              mandatory: true,
              label: translations['VENTRAL_BEVEL'],
              apiField: 'ventral_margin_ventral_bevel',
              type: FormInputType.SELECT,
              width: FormInputWidth.L,
              values: [
                { code: 'null', description: '-' },
                { code: 'Absent', description: translations['ABSENT'] },
                { code: 'InProcess', description: translations['IN_PROCESS'] },
                { code: 'Present', description: translations['PRESENT'] },
              ],
              showAtlasButton: this.showAtlasButton,
              value:
                this.currentMode === 'single-sample'
                  ? this.label?.ventral_margin_ventral_bevel
                  : null,
              readOnly:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples',
            },
            {
              id: 'VentralMargin',
              mandatory: true,
              label: translations['VENTRAL_MARGIN'],
              apiField: 'ventral_margin_ventral_margin',
              type: FormInputType.SELECT,
              width: FormInputWidth.L,
              values: [
                { code: 'null', description: '-' },
                { code: 'Absent', description: translations['ABSENT'] },
                {
                  code: 'PartiallyFormed',
                  description: translations['PARTIALLY_FORMED'],
                },
                {
                  code: 'FormedWithoutRarefactions',
                  description: translations['FORMED_WITHOUT_RAREFACTIONS'],
                },
                {
                  code: 'FormedWitFewRarefactions',
                  description: translations['FORMED_WITH_FEW_RAREFACTIONS'],
                },
                {
                  code: 'FormedWithLotRecessesAndProtrusions',
                  description:
                    translations['FORMED_WITH_LOT_RECESSES_AND_PROTRUSIONS'],
                },
              ],
              showAtlasButton: this.showAtlasButton,
              value:
                this.currentMode === 'single-sample'
                  ? this.label?.ventral_margin_ventral_margin
                  : null,
              readOnly:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples',
            },
          ],
        },
        {
          groupName: translations['OBSERVATIONS'],
          child: [
            {
              id: 'obs',
              mandatory: false,
              label: '',
              apiField: 'observationsField',
              type: FormInputType.TEXTAREA,
              width: FormInputWidth.FULL,
              showAtlasButton: false,
              readOnly:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples',
            },
          ],
        },
        {
          groupName: translations['ESTIMATED_BY_PRACTITIONER'],
          child: [
            {
              id: 'ToddPhase',
              mandatory: false,
              label: translations['TODD_PHASE'],
              apiField: 'toddPhasePractitioner',
              type: FormInputType.SELECT,
              width: FormInputWidth.L,
              showAtlasButton: false,
              readOnly:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples'
                  ? true
                  : false,
              value:
                this.currentMode === 'single-sample' ||
                this.currentMode === 'multiple-samples'
                  ? this.label?.toddPhasePractitioner
                  : null,
              values: [
                { code: 'null', description: '-' },
                { code: 'Ph01-19', description: 'Ph01-19' },
                { code: 'Ph02-20-21', description: 'Ph02-20-21 ' },
                { code: 'Ph03-22-24', description: 'Ph03-22-24' },
                { code: 'Ph04-25-26', description: 'Ph04-25-26' },
                { code: 'Ph05-27-30', description: 'Ph05-27-30' },
                { code: 'Ph06-31-34', description: 'Ph06-31-34' },
                { code: 'Ph07-35-39', description: 'Ph07-35-39' },
                { code: 'Ph08-40-44', description: 'Ph08-40-44' },
                { code: 'Ph09-45-49', description: 'Ph09-45-49' },
                { code: 'Ph10-50-', description: 'Ph10-50+' },
              ],
            },
          ],
        },
      ];
      this.cdRef.detectChanges();
    });
  }

  loadPubisData(shortId: string): void {
    this.pubisService.getByShortId(shortId).subscribe(pubis => {
      this.pubisObj = pubis;

      if (this.pubisObj?.id) {
        this.pubisService.getFilesByPubisId(this.pubisObj.id).subscribe({
          next: (files: FilesByModelType) => {
            this.bones_imgs = files['2D'] ?? [];
            this.model = files['3D']?.[0] ?? null;
          },
          error: err => {
            console.error('Error al obtener archivos:', err);
          },
        });
      }
    });
  }

  openAtlas(id?: string) {
    if (id) this.setAtlas(id);
    this.atlasOpened = true;
    this.showAtlas = true;
  }

  closeAtlas() {
    if (this.atlasOpened) {
      this.atlasOpened = false;
      this.atlastToShow = [];
      setTimeout(() => {
        this.showAtlas = false;
      }, 1000);
    }
  }

  clickToggle(value: boolean) {
    this.toggleCarouselViewer = value;
  }

  setAtlas(id: string) {
    const selectedAtlas = this.atlas.find(data => data.id === id);
    if (selectedAtlas) this.atlastToShow = selectedAtlas.info;
  }

  getInputWidth(width?: string) {
    return width ? { [width]: true } : null;
  }

  showToast(succeded: string) {
    if (succeded === 'success') {
      this.translate.get('TOAST.SUCCESS.SAVED').subscribe(msg => {
        this.toastService.show({
          severity: ToastType.SUCCESS,
          summary: msg.SUMMARY,
          detail: msg.DETAIL,
        });
      });
    }
  }

  openNewWindow(): void {
    const childWindow = window.open('/pubis-data', '_blank');

    if (!childWindow) {
      // popup bloqueado
      console.error('No se pudo abrir la ventana');
      return;
    }

    // Mensaje a enviar
    const payload = this.pubisObj;
    const targetOrigin = window.location.origin;

    // Intenta cada 200ms hasta que la hija responda
    const interval = setInterval(() => {
      try {
        childWindow.postMessage(payload, targetOrigin);
      } catch (e) {
        /* puede lanzar mientras la pestaña se carga */
      }
    }, 200);

    // Escucha un «ack» desde la hija y deja de reenviar
    const handleAck = (event: MessageEvent) => {
      if (event.source === childWindow && event.data === 'ACK_PUBIS') {
        clearInterval(interval);
        window.removeEventListener('message', handleAck);
      }
    };

    window.addEventListener('message', handleAck);
  }

  saveFormData() {
    this.formSubmitted = true;

    if (this.form.valid) {
      this.showErrorMessage = false;
      const formData = this.form.value;

      this.authService
        .getUserEmail()
        .pipe(
          switchMap(email => {
            if (email) {
              return this.userService.getUserByEmail(email);
            } else {
              throw new Error('No se encontró el email del usuario');
            }
          }),
          switchMap(user => {
            const dataToSend = {
              auricular_face_ridges_and_grooves:
                formData.auricular_face_ridges_and_grooves,
              auricular_face_irregular_pososity:
                formData.auricular_face_irregular_pososity,
              upper_symphyseal_extremity_definition:
                formData.upper_symphyseal_extremity_definition,
              upper_symphyseal_extremity_bony_nodule:
                formData.upper_symphyseal_extremity_bony_nodule,
              lower_symphyseal_extremity_definition:
                formData.lower_symphyseal_extremity_definition,
              dorsal_groove_definition: formData.dorsal_groove_definition,
              dorsal_groove_dorsal_plateau:
                formData.dorsal_groove_dorsal_plateau,
              ventral_margin_ventral_bevel:
                formData.ventral_margin_ventral_bevel,
              ventral_margin_ventral_margin:
                formData.ventral_margin_ventral_margin,
              observationsField: formData.observationsField,
              toddPhasePractitioner: formData.toddPhasePractitioner,
              pubisId: this.pubisObj?.id,
              userId: user.id,
              isTraining: false,
            };

            return this.labelService.createLabel(dataToSend);
          })
        )
        .subscribe({
          next: () => {
            this.showToast('success');
          },
          error: error => {
            console.error('Error al guardar el label', error);
          },
        });
    } else {
      this.showErrorMessage = true;
    }
  }

  checkFormData() {
    this.formSubmitted = true;
    const formData = this.form.value;
    const userSelectedValues: Record<string, any> = formData;

    const pubisId = this.pubisObj?.id;

    if (!pubisId) {
      console.warn('No pubis ID found.');
      return;
    }

    this.pubisService
      .getLabelModes(pubisId)
      .pipe(
        switchMap(labelModes => {
          this.labelModes = labelModes;

          this.comparisonResults = {};
          let totalItems = 0;
          let correctItems = 0;

          for (const [label, systemValues] of Object.entries(this.labelModes)) {
            const userValues = userSelectedValues[label] || [];
            const userArray = Array.isArray(userValues)
              ? userValues
              : [userValues];

            const matchFound = userArray.some(val =>
              systemValues.includes(val)
            );
            this.comparisonResults[label] = matchFound
              ? 'correct'
              : 'incorrect';

            totalItems++;
            if (matchFound) correctItems++;
          }

          this.score = parseFloat(
            ((correctItems / totalItems) * 100).toFixed(2)
          );
          this.cdRef.markForCheck();

          return this.authService.getUserEmail();
        }),
        switchMap(email => {
          if (email) {
            return this.userService.getUserByEmail(email);
          } else {
            throw new Error('No se encontró el email del usuario');
          }
        }),
        switchMap(user => {
          const dataToSend = {
            auricular_face_ridges_and_grooves:
              formData.auricular_face_ridges_and_grooves,
            auricular_face_irregular_pososity:
              formData.auricular_face_irregular_pososity,
            upper_symphyseal_extremity_definition:
              formData.upper_symphyseal_extremity_definition,
            upper_symphyseal_extremity_bony_nodule:
              formData.upper_symphyseal_extremity_bony_nodule,
            lower_symphyseal_extremity_definition:
              formData.lower_symphyseal_extremity_definition,
            dorsal_groove_definition: formData.dorsal_groove_definition,
            dorsal_groove_dorsal_plateau: formData.dorsal_groove_dorsal_plateau,
            ventral_margin_ventral_bevel: formData.ventral_margin_ventral_bevel,
            ventral_margin_ventral_margin:
              formData.ventral_margin_ventral_margin,
            observationsField: formData.observationsField,
            toddPhasePractitioner: formData.toddPhasePractitioner,
            pubisId: pubisId,
            userId: user.id,
            score: this.score,
            isTraining: true,
          };

          return this.labelService.createLabel(dataToSend);
        })
      )
      .subscribe({
        next: () => {
          this.showScoreModal = true;
        },
        error: error => {
          console.error('Error al procesar el formulario:', error);
        },
      });
  }

  closeScoreModal() {
    this.showScoreModal = false;
  }
}
