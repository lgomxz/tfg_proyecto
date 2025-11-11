import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TableComponent } from '../../components/table/table.component';
import { ColumnsConfig } from '../../components/table/table';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchBarComponent } from '../../components/search/search.component';
import { NewDialogComponent } from '../../components/new-dialog/new-dialog.component';
import { DialogConfig } from '../../components/new-dialog/dialog';
import { StepsModule } from 'primeng/steps';
import {
  CollectionFormConfig,
  FormInputType,
  FormInputWidth,
} from '../../components/form/form';
import { TabViewModule } from 'primeng/tabview';
import { ActivatedRoute, NavigationEnd } from '@angular/router';
import { Pubis } from '../../models/pubis';
import { DigitalModel } from '../../models/digital-model';
import { AuthService } from '../../services/auth.service';
import { User } from '../../models/user';
import { UserApiService } from '../../services/user-api.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { RolesApiService } from '../../services/roles-api.service';
import { UploadService } from '../../services/upload.service';
import { Subject } from '../../models/subject';
import { SubjectService } from '../../services/subject.service';
import { FileService } from '../../services/file.service';
import { PubisService } from '../../services/pubis.service';
import { DigitalModelService } from '../../services/digital-model.service';
import { MyFile } from '../../models/file';
import { DialogModule } from 'primeng/dialog';
import { filter, forkJoin, map, of, startWith, switchMap, take } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CollectionApiService } from '../../services/collection-service.service';
import { CollectionPubisService } from '../../services/collection-pubis.service';
import { Router, RouterModule } from '@angular/router';

export interface DropdownOption {
  name: string;
  code: string;
}

export interface DropdownData {
  label: string;
  options: DropdownOption[];
  selectedOption?: DropdownOption;
}

@UntilDestroy()
@Component({
  selector: 'app-samples',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    InputTextModule,
    ButtonModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    TableComponent,
    DropdownModule,
    FormsModule,
    ReactiveFormsModule,
    SearchBarComponent,
    NewDialogComponent,
    StepsModule,
    TabViewModule,
    DialogModule,
    TranslateModule,
    RouterModule,
    FormsModule,
  ],
  templateUrl: './pubis.component.html',
  styleUrls: ['./pubis.component.scss'],
})
export class PubisComponent implements OnInit {
  showMainContent = true;
  selectedRow?: Pubis;
  showNewSampleDialog: boolean = false;
  showDeleteSampleDialog: boolean = false;
  selectedRadio: string = '';
  showInfoDialog: boolean = false;
  excelData: any[] = [];
  collectionId: string | null = null;
  collectionName: string = '';
  emailUser: string | undefined;
  user!: User;
  showAdminButtons: boolean = false;
  newDialogConfig!: DialogConfig;
  allPubisData: Pubis[] = [];
  searchTerm: string = '';
  isEditMode: boolean = false;

  existingSubject: Subject | null = null;
  existingPubis: Pubis | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('searchText') input!: ElementRef<HTMLInputElement>;
  @ViewChild(NewDialogComponent) newCollectionDialogRef!: NewDialogComponent;

  columnMapping: { [key: string]: keyof Subject } = {
    id: 'id',
    name: 'name',
    lastname: 'lastname',
    gender: 'sex',
    biological_age_at_death: 'biological_age_at_death',
    build: 'body_build',
    preliminary_proceedings: 'preliminary_proceedings',
    acquisition_year: 'acquisition_year',
    in_court: 'judged',
    death_cause: 'death_cause',
    toxicological_report: 'toxicological_report',
  };

  collectionsColumns: ColumnsConfig[] = [
    { title: 'ID', apiField: 'shortId' },
    { title: 'Subject ID', apiField: 'subjectShortId' },
    { title: 'Laterality', apiField: 'laterality' },
  ];

  dropdowns: DropdownData[] = [
    {
      label: 'Labelled',
      options: [
        { name: 'Yes', code: 'Y' },
        { name: 'No', code: 'N' },
      ],
    },
    {
      label: 'Feedback',
      options: [
        { name: 'Yes', code: 'YF' },
        { name: 'No', code: 'NF' },
      ],
    },
  ];

  newSampleForm: CollectionFormConfig[] = [
    {
      groupName: 'Personal Information',
      child: [
        {
          id: 'name',
          mandatory: true,
          label: 'Name',
          apiField: 'name',
          type: FormInputType.TEXT,
          width: FormInputWidth.M,
          values: [],
          showAtlasButton: false,
        },
        {
          id: 'lastName',
          mandatory: false,
          label: 'Last Name',
          apiField: 'lastname',
          type: FormInputType.TEXT,
          width: FormInputWidth.M,
          values: [],
          showAtlasButton: false,
        },
        {
          id: 'sex',
          mandatory: false,
          label: 'Gender',
          apiField: 'sex',
          type: FormInputType.SELECT,
          width: FormInputWidth.S,
          values: [
            { code: 'masc', description: 'Male' },
            { code: 'fem', description: 'Female' },
          ],
          showAtlasButton: false,
        },
        {
          id: 'ageAtDeath',
          mandatory: false,
          label: 'Biologial Age-at-death',
          apiField: 'biologicalAgeAtDeath',
          type: FormInputType.NUMBER,
          width: FormInputWidth.S,
          values: [],
          showAtlasButton: false,
        },
        {
          id: 'build',
          mandatory: false,
          label: 'Build',
          apiField: 'build',
          type: FormInputType.TEXT,
          width: FormInputWidth.L,
          values: [],
          showAtlasButton: false,
        },
        // Right Pubis Information
        {
          id: 'rightLaterality',
          mandatory: false, // No es obligatorio
          label: 'Right Laterality',
          apiField: 'rightLaterality',
          type: FormInputType.SELECT,
          width: FormInputWidth.M,
          values: [
            { code: 'yesR', description: 'YES' },
            { code: 'noR', description: 'NO' },
          ],
          showAtlasButton: false,
        },
        {
          id: 'rightPreservationStatus',
          mandatory: false, // No es obligatorio
          label: 'Right Preservation Status',
          apiField: 'rightPreservationStatus',
          type: FormInputType.TEXT,
          width: FormInputWidth.L,
          values: [],
          showAtlasButton: false,
        },
        // Left Pubis Information
        {
          id: 'leftLaterality',
          mandatory: false, // No es obligatorio
          label: 'Left Laterality',
          apiField: 'leftLaterality',
          readOnly: false,
          type: FormInputType.SELECT,
          width: FormInputWidth.M,
          values: [
            { code: 'yesL', description: 'YES' },
            { code: 'noL', description: 'NO' },
          ],
          showAtlasButton: false,
        },
        {
          id: 'leftPreservationStatus',
          mandatory: false, // No es obligatorio
          label: 'Left Preservation Status',
          apiField: 'leftPreservationStatus',
          type: FormInputType.TEXT,
          width: FormInputWidth.L,
          values: [],
          showAtlasButton: false,
        },
      ],
    },
    {
      groupName: 'Case Information',
      child: [
        {
          id: 'preliminaryProceedings',
          mandatory: false,
          label: 'Preliminary Proceedings',
          apiField: 'preliminaryProceedings',
          type: FormInputType.TEXTAREA,
          width: FormInputWidth.L,
          values: [],
          showAtlasButton: false,
        },
      ],
    },
    {
      groupName: 'Medical Case Details',
      child: [
        {
          id: 'boneAcquisition',
          mandatory: false,
          label: 'Year of Pubic Bone Acquisition',
          apiField: 'boneAcquisition',
          type: FormInputType.NUMBER,
          width: FormInputWidth.S,
          values: [],
          showAtlasButton: false,
        },
        {
          id: 'courtEvaluation',
          mandatory: false,
          label: 'Court Evaluation',
          apiField: 'courtEvaluation',
          type: FormInputType.SELECT,
          width: FormInputWidth.M,
          values: [
            { code: 'yesJ', description: 'YES' },
            { code: 'noJ', description: 'NO' },
          ],
          showAtlasButton: false,
        },
        {
          id: 'causeOfDeath',
          mandatory: false,
          label: 'Cause of Death',
          apiField: 'causeOfDeath',
          type: FormInputType.TEXTAREA,
          width: FormInputWidth.FULL,
          values: [],
          showAtlasButton: false,
        },
        {
          id: 'toxicologicalReport',
          mandatory: false,
          label: 'Toxicological Report',
          apiField: 'toxicologicalReport',
          type: FormInputType.TEXTAREA,
          width: FormInputWidth.FULL,
          values: [],
          showAtlasButton: false,
        },
      ],
    },
  ];

  deleteDialogConfig: DialogConfig = {
    header: 'Delete Sample',
    stepsContent: [
      {
        text: 'Are you sure you want to delete this sample?',
        formConfig: [],
      },
    ],
    buttons: [
      { label: 'Delete', action: () => this.delete(), severity: 'danger' },
      {
        label: 'Cancel',
        action: () => this.closeDialog(),
        severity: 'secondary',
      },
    ],
    showStepper: false,
  };

  constructor(
    private cdr: ChangeDetectorRef,
    private activatedRoute: ActivatedRoute,
    private authApiService: AuthService,
    private collectionService: CollectionApiService,
    private userApiService: UserApiService,
    private rolesService: RolesApiService,
    private uploadService: UploadService,
    private subjectService: SubjectService,
    private fileService: FileService,
    private pubisService: PubisService,
    private router: Router,
    private translate: TranslateService,
    private digitalModelService: DigitalModelService,
    private collectionPubisService: CollectionPubisService
  ) {
    this.newSampleForm = this.createNewSampleForm();
    this.initializeNewDialogConfig();
  }
  ngOnInit(): void {
    this.updateNewSampleFormTranslations(false);
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        startWith(null), // para disparar la lógica una vez al inicio
        switchMap(() => {
          const urlTree = this.router.parseUrl(this.router.url);
          const segments = urlTree.root.children['primary']?.segments;
          console.log('Segments:', segments);

          const rootSegment = segments?.[0]?.path;
          const secondSegment = segments?.[1]?.path;

          console.log('rootSegment:', rootSegment);
          console.log('secondSegment:', secondSegment);

          this.showMainContent = rootSegment === 'pubis' && !secondSegment;

          if (this.showMainContent) {
            return this.activatedRoute.queryParamMap.pipe(take(1));
          } else {
            return of(null);
          }
        }),
        untilDestroyed(this)
      )
      .subscribe(params => {
        if (params) {
          this.collectionId = params.get('shortId');
          if (this.collectionId) {
            console.log('CollectionId está presente:', this.collectionId);
            this.collectionService
              .getCollectionName(this.collectionId)
              .pipe(untilDestroyed(this))
              .subscribe({
                next: data => {
                  console.log('Collection name:', data);
                },
                error: error => {
                  console.error('Error al obtener los datos de pubis:', error);
                },
              });
          } else {
            console.error(
              'El collectionId no está presente en los parámetros de la URL.'
            );
          }
        } else {
          console.log(
            'No estamos en /pubis sin segundo segmento, no cargamos collection.'
          );
        }
      });

    // Obtiene correo y role para mostrar botones admin
    this.authApiService
      .getUserEmail()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: email => {
          this.emailUser = email || 'default@example.com';
          this.userApiService
            .getRoleIdByEmail(this.emailUser)
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
                        this.showAdminButtons = true;
                      }
                    },
                    error: error =>
                      console.error('Error fetching role name:', error),
                  });
              },
              error: error =>
                console.error('Error al obtener el role ID:', error),
            });
        },
        error: () => console.error('Error al obtener el email'),
      });
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateNewSampleFormTranslations(false);
    });
    // Cargar datos generales solo una vez
    this.loadAllPubis();
  }

  closeInfoDialog() {
    this.showInfoDialog = false;
  }

  selectRow(row: Pubis) {
    this.selectedRow = row;
  }

  applyFilter(searchText: string) {
    const filteredData = this.allPubisData.filter(cd =>
      cd.laterality.toLowerCase().includes(searchText.toLowerCase())
    );
    this.allPubisData = filteredData;
  }
  clearFilter() {
    this.input.nativeElement.value = '';
  }

  createNewSampleForm(): CollectionFormConfig[] {
    return [
      {
        groupName: 'Personal Information',
        child: [
          {
            id: 'name',
            mandatory: true,
            label: 'Name',
            apiField: 'name',
            type: FormInputType.TEXT,
            width: FormInputWidth.M,
            values: [],
            showAtlasButton: false,
          },
          {
            id: 'lastName',
            mandatory: false,
            label: 'Last Name',
            apiField: 'lastname',
            type: FormInputType.TEXT,
            width: FormInputWidth.M,
            values: [],
            showAtlasButton: false,
          },
          {
            id: 'sex',
            mandatory: false,
            label: 'Gender',
            apiField: 'sex',
            type: FormInputType.SELECT,
            width: FormInputWidth.S,
            values: [
              { code: 'masc', description: 'Male' },
              { code: 'fem', description: 'Female' },
            ],
            showAtlasButton: false,
          },
          {
            id: 'ageAtDeath',
            mandatory: false,
            label: 'Biologial Age-at-death',
            apiField: 'biologicalAgeAtDeath',
            type: FormInputType.NUMBER,
            width: FormInputWidth.S,
            values: [],
            showAtlasButton: false,
          },
          {
            id: 'build',
            mandatory: false,
            label: 'Build',
            apiField: 'build',
            type: FormInputType.TEXT,
            width: FormInputWidth.L,
            values: [],
            showAtlasButton: false,
          },
          {
            id: 'rightLaterality',
            mandatory: false,
            label: 'Right Laterality',
            apiField: 'rightLaterality',
            type: FormInputType.SELECT,
            width: FormInputWidth.L,
            values: [
              { code: 'yesR', description: 'YES' },
              { code: 'noR', description: 'NO' },
            ],
            showAtlasButton: false,
          },
          {
            id: 'rightPreservationStatus',
            mandatory: false,
            label: 'Right Preservation Status',
            apiField: 'rightPreservationStatus',
            type: FormInputType.TEXT,
            width: FormInputWidth.M,
            values: [],
            showAtlasButton: false,
          },
          {
            id: 'leftLaterality',
            mandatory: false,
            label: 'Left Laterality',
            apiField: 'leftLaterality',
            type: FormInputType.SELECT,
            width: FormInputWidth.L,
            values: [
              { code: 'yesL', description: 'YES' },
              { code: 'noL', description: 'NO' },
            ],
            showAtlasButton: false,
          },
          {
            id: 'leftPreservationStatus',
            mandatory: false,
            label: 'Left Preservation Status',
            apiField: 'leftPreservationStatus',
            type: FormInputType.TEXT,
            width: FormInputWidth.M,
            values: [],
            showAtlasButton: false,
          },
        ],
      },
      {
        groupName: 'Case Information',
        child: [
          {
            id: 'preliminaryProceedings',
            mandatory: false,
            label: 'Preliminary Proceedings',
            apiField: 'preliminaryProceedings',
            type: FormInputType.TEXTAREA,
            width: FormInputWidth.L,
            values: [],
            showAtlasButton: false,
          },
        ],
      },
      {
        groupName: 'Medical Case Details',
        child: [
          {
            id: 'boneAcquisition',
            mandatory: false,
            label: 'Year of Pubic Bone Acquisition',
            apiField: 'boneAcquisition',
            type: FormInputType.NUMBER,
            width: FormInputWidth.S,
            values: [],
            showAtlasButton: false,
          },
          {
            id: 'courtEvaluation',
            mandatory: false,
            label: 'Court Evaluation',
            apiField: 'courtEvaluation',
            type: FormInputType.SELECT,
            width: FormInputWidth.M,
            values: [
              { code: 'yesJ', description: 'YES' },
              { code: 'noJ', description: 'NO' },
            ],
            showAtlasButton: false,
          },
          {
            id: 'causeOfDeath',
            mandatory: false,
            label: 'Cause of Death',
            apiField: 'causeOfDeath',
            type: FormInputType.TEXTAREA,
            width: FormInputWidth.FULL,
            values: [],
            showAtlasButton: false,
          },
          {
            id: 'toxicologicalReport',
            mandatory: false,
            label: 'Toxicological Report',
            apiField: 'toxicologicalReport',
            type: FormInputType.TEXTAREA,
            width: FormInputWidth.FULL,
            values: [],
            showAtlasButton: false,
          },
        ],
      },
    ];
  }
  private updateNewSampleFormTranslations(isEdit: boolean): void {
    this.translate.get('PUBIS_DIALOGS').subscribe((translations: any) => {
      if (!this.newSampleForm?.length) return;

      // Personal Information
      this.newSampleForm[0].groupName = translations['PERSONAL_INFO'];
      this.newSampleForm[0].child.forEach(field => {
        switch (field.apiField) {
          case 'name':
            field.label = translations['NAME'];
            break;
          case 'lastname':
            field.label = translations['LAST_NAME'];
            break;
          case 'sex':
            field.label = translations['GENDER'];
            field.values = [
              { code: 'masc', description: translations['MALE'] },
              { code: 'fem', description: translations['FEMALE'] },
            ];
            break;
          case 'biologicalAgeAtDeath':
            field.label = translations['BIOLOGICAL_AGE_AT_DEATH'];
            break;
          case 'build':
            field.label = translations['BUILD'];
            break;
          case 'rightLaterality':
            field.label = translations['RIGHT_LATERALITY'];
            field.values = [
              { code: 'yesR', description: translations['YES'] },
              { code: 'noR', description: translations['NO'] },
            ];
            break;
          case 'rightPreservationStatus':
            field.label = translations['RIGHT_PRESERVATION_STATUS'];
            break;
          case 'leftLaterality':
            field.label = translations['LEFT_LATERALITY'];
            field.values = [
              { code: 'yesL', description: translations['YES'] },
              { code: 'noL', description: translations['NO'] },
            ];
            break;
          case 'leftPreservationStatus':
            field.label = translations['LEFT_PRESERVATION_STATUS'];
            break;
        }
      });

      // Case Information
      this.newSampleForm[1].groupName = translations['CASE_INFO'];
      this.newSampleForm[1].child.forEach(field => {
        if (field.apiField === 'preliminaryProceedings') {
          field.label = translations['PRELIMINARY_PROCEEDINGS'];
        }
      });

      // Medical Case Details
      this.newSampleForm[2].groupName = translations['MEDICAL_CASE_DETAILS'];
      this.newSampleForm[2].child.forEach(field => {
        switch (field.apiField) {
          case 'boneAcquisition':
            field.label = translations['BONE_ACQUISITION_YEAR'];
            break;
          case 'courtEvaluation':
            field.label = translations['COURT_EVALUATION'];
            field.values = [
              { code: 'yesJ', description: translations['YES'] },
              { code: 'noJ', description: translations['NO'] },
            ];
            break;
          case 'causeOfDeath':
            field.label = translations['CAUSE_OF_DEATH'];
            break;
          case 'toxicologicalReport':
            field.label = translations['TOXICOLOGICAL_REPORT'];
            break;
        }
      });

      if (this.newDialogConfig) {
        if (this.newDialogConfig.stepsContent?.length) {
          if (!isEdit && this.newDialogConfig?.stepsContent?.length) {
            this.newDialogConfig.header = translations['CREATE_NEW_SAMPLE'];
            this.newDialogConfig.stepsContent[0].label =
              translations['STEP_SELECT_OPTION'];
            this.newDialogConfig.stepsContent[0].text =
              translations['STEP_SELECT_OPTION_TEXT'];
            this.newDialogConfig.stepsContent[0].radioButtons = [
              { label: translations['ADD_NEW_SAMPLE'], value: 'addNewSample' },
              {
                label: translations['ADD_MULTIPLE_SAMPLES'],
                value: 'addMultipleSamples',
              },
            ];

            this.newDialogConfig.stepsContent[1].label =
              translations['STEP_PUBIS_DATA'];
            this.newDialogConfig.stepsContent[2].label =
              translations['STEP_IMPORT_IMAGES'];
            this.newDialogConfig.stepsContent[2].text =
              translations['STEP_IMPORT_IMAGES_TEXT'];
            this.newDialogConfig.stepsContent[3].label =
              translations['STEP_IMPORT_3D'];
            this.newDialogConfig.stepsContent[3].text =
              translations['STEP_IMPORT_3D_TEXT'];
          } else if (this.newDialogConfig.stepsContent?.length) {
            this.newDialogConfig.header = translations['EDIT_SAMPLE'];
            this.newDialogConfig.stepsContent[0].label =
              translations['STEP_PUBIS_DATA'];
            this.newDialogConfig.stepsContent[1].label =
              translations['STEP_IMPORT_IMAGES'];
            this.newDialogConfig.stepsContent[1].text =
              translations['STEP_IMPORT_IMAGES_TEXT'];
            this.newDialogConfig.stepsContent[2].label =
              translations['STEP_IMPORT_3D'];
            this.newDialogConfig.stepsContent[2].text =
              translations['STEP_IMPORT_3D_TEXT'];
          }
        }
      }

      this.cdr.detectChanges();
    });
  }

  // Función para cargar los Pubis y asignarles el subjectShortId
  loadAllPubis() {
    this.pubisService
      .getPubisByCollection(this.collectionId)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: data => {
          console.log(data);
          // Aquí extraemos el ID del sujeto de cada pubis y lo añadimos a la lista
          this.allPubisData = data.map(pubis => ({
            ...pubis, // Mantiene todos los campos de Pubis
            subjectShortId: pubis.subject ? pubis.subject.shortId : null, // Añadimos el ID del sujeto
          }));
        },
        error: error => {
          console.error('Error al obtener los datos de pubis:', error);
        },
      });
  }

  initializeNewDialogConfig() {
    this.newDialogConfig = {
      header: 'Create New Sample',
      buttons: [],
      showStepper: true,
      stepsContent: [
        {
          label: 'Select option',
          text: 'Select one of the following options:',
          showUpload: false,
          showForm: false,
          radioButtons: [
            {
              label: 'Add new sample to the collection',
              value: 'addNewSample',
            },
            {
              label: 'Add multiple samples to the collection',
              value: 'addMultipleSamples',
            },
          ],
        },
        {
          label: 'Pubis Data',
          showForm: true,
          formConfig: this.newSampleForm,
          showUpload: false,
          isExcelUpload: false,
        },
        {
          label: 'Import images',
          text: 'Select the images you want to import',
          showUpload: true,
          imageType: '2D',
          isExcelUpload: false,
        },
        {
          label: 'Import 3D models',
          text: 'Select the 3D Models you want to import',
          showUpload: true,
          imageType: '3D',
          isExcelUpload: false,
        },
      ],
    };
  }

  onDeleteRow(row: Pubis) {
    this.selectedRow = row;
    this.showDialog('delete');
  }

  existingFiles: { '2D': File[]; '3D': File[] } | null = null;

  // Método que se llama cuando se recibe el evento de editar
  onEditRow(row: Pubis) {
    this.selectedRow = row;

    if (!this.selectedRow?.shortId) {
      console.error('No se puede editar: shortId no definido');
      return;
    }

    this.pubisService
      .getByShortId(this.selectedRow.shortId)
      .subscribe(existingData => {
        if (!existingData) return;
        this.existingSubject = existingData.subject!;
        this.existingPubis = existingData;

        this.pubisService
          .getFilesByPubisId(existingData.id!)
          .subscribe(filesByModelType => {
            const leftFiles = filesByModelType['2D'] || [];
            const rightFiles = filesByModelType['3D'] || [];

            this.existingFiles = { '2D': leftFiles, '3D': rightFiles };

            this.showDialog('edit', existingData);
          });
      });
  }

  showDialog(type: 'new' | 'delete' | 'edit', existingData?: any) {
    this.translate.get('PUBIS_DIALOGS').subscribe(() => {
      if (type === 'new') {
        this.openNewSampleDialog();
      } else if (type === 'edit') {
        this.isEditMode = true;
        this.openEditSampleDialog(existingData);
      } else if (type === 'delete') {
        this.showDeleteSampleDialog = true;
        console.log('DELETE PULSADO');
      }
    });
  }

  private openNewSampleDialog() {
    // Reset completo antes de abrir
    this.newCollectionDialogRef.activeStepIndex = 0;
    this.selectedRadio = '';

    // Reset total de estado previo
    this.newSampleForm = this.createNewSampleForm();
    if (this.newCollectionDialogRef) {
      this.newCollectionDialogRef.filesHistory = [];
      this.newCollectionDialogRef.removeAllUploadComponents();
    }

    this.existingFiles = null; // muy importante
    this.initializeNewDialogConfig();
    this.updateNewSampleFormTranslations(false);

    this.showNewSampleDialog = true;

    // Espera render y sincroniza formulario vacío
    setTimeout(() => {
      if (this.newCollectionDialogRef) {
        this.newCollectionDialogRef.updateForm(this.newSampleForm);
      }
    });
  }

  private openEditSampleDialog(existingData: any) {
    this.newCollectionDialogRef.activeStepIndex = 0;
    this.newSampleForm = this.createNewSampleForm();

    this.initializeEditDialogConfig();
    this.populateFormWithData(existingData);
    this.updateNewSampleFormTranslations(true);

    this.showNewSampleDialog = true;

    // Espera a que el diálogo se renderice
    setTimeout(() => {
      if (this.newCollectionDialogRef) {
        this.newCollectionDialogRef.updateForm(this.newSampleForm);
      }
    });
  }

  private initializeEditDialogConfig() {
    this.newDialogConfig = {
      header: 'Edit Sample',
      buttons: [],
      showStepper: true,
      stepsContent: [
        {
          label: 'Pubis Data',
          formConfig: this.newSampleForm,
          showUpload: false,
          showForm: true,
        },
        {
          label: 'Images',
          text: 'Add or remove 2D images',
          showUpload: true,
          imageType: '2D',
        },
        {
          label: '3D Models',
          text: 'Add or remove 3D models',
          showUpload: true,
          imageType: '3D',
        },
      ],
    };

    // Fuerza a Angular a reconocer la nueva referencia
    this.newDialogConfig = { ...this.newDialogConfig };
    this.cdr.detectChanges();
  }

  fieldMapping: Record<string, string> = {
    rightLaterality: 'laterality',
    rightPreservationStatus: 'preservation_state',
    leftLaterality: 'laterality',
    leftPreservationStatus: 'preservation_state',
    biologicalAgeAtDeath: 'biological_age_at_death',
    build: 'body_build',
    preliminaryProceedings: 'preliminary_proceedings',
    toxicologicalReport: 'toxicological_report',
    causeOfDeath: 'death_cause',
    courtEvaluation: 'judged',
    boneAcquisition: 'acquisition_year',
  };

  private populateFormWithData(data: any) {
    if (!this.newSampleForm || !data) return;

    this.newSampleForm.forEach(group => {
      // Filtra lateralidades que no corresponden
      group.child = group.child.filter(field => {
        if (!field) return false;

        if (
          field.apiField === 'rightLaterality' ||
          field.apiField === 'leftLaterality'
        ) {
          return false;
        }

        if (
          field.apiField === 'rightPreservationStatus' &&
          data.laterality !== 'right'
        ) {
          return false;
        }

        if (
          field.apiField === 'leftPreservationStatus' &&
          data.laterality !== 'left'
        ) {
          return false;
        }

        return true;
      });

      // Asigna valores a los campos filtrados
      group.child.forEach(field => {
        if (!field) return;

        // Lateralidad
        if (field.apiField === 'rightLaterality') {
          field.value = 'yesR';
          return;
        }

        if (field.apiField === 'leftLaterality') {
          field.value = 'yesL';
          return;
        }

        // Preservation status
        if (
          field.apiField === 'rightPreservationStatus' ||
          field.apiField === 'leftPreservationStatus'
        ) {
          field.value = data.preservation_state;
          return;
        }

        // Resto de campos
        const apiField = this.fieldMapping?.[field.apiField] || field.apiField;
        const rawValue = data[apiField] ?? data.subject?.[apiField];
        let value = rawValue;

        if (
          field.type === FormInputType.NUMBER &&
          typeof rawValue === 'string'
        ) {
          const date = new Date(rawValue);
          if (!isNaN(date.getFullYear())) value = date.getFullYear();
        }

        field.value = value ?? null;
      });
    });

    // Actualiza el formulario en el diálogo
    this.newCollectionDialogRef?.updateForm(this.newSampleForm);
  }

  closeDialog() {
    this.showNewSampleDialog = false;
    this.showDeleteSampleDialog = false;
  }

  openPubis(row: Pubis): void {
    this.router.navigate(['pubis', 'labelling'], {
      queryParams: { shortId: row.shortId },
    });
  }

  accept(data: any) {
    const leftFiles2D: File[] = [];
    const rightFiles2D: File[] = [];
    const leftFiles3D: File[] = [];
    const rightFiles3D: File[] = [];
    let found2D = false;

    data.filesHistory.forEach(
      (history: { leftFiles: File[]; rightFiles: File[] }) => {
        const containsObjFileLeft = history.leftFiles.some(file =>
          file.name.endsWith('.obj')
        );
        const containsObjFileRight = history.rightFiles.some(file =>
          file.name.endsWith('.obj')
        );

        if (!found2D && !containsObjFileLeft && !containsObjFileRight) {
          leftFiles2D.push(...history.leftFiles);
          rightFiles2D.push(...history.rightFiles);
          found2D = true;
        } else {
          leftFiles3D.push(...history.leftFiles);
          rightFiles3D.push(...history.rightFiles);
        }
      }
    );

    if (this.isEditMode && this.existingSubject && this.existingPubis) {
      this.showNewSampleDialog = false;

      const updatedSubjectData: Partial<Subject> = {
        name: data.formData.name,
        lastname: data.formData.lastname,
        sex: data.formData.sex,
        biological_age_at_death: data.formData.biologicalAgeAtDeath,
        preliminary_proceedings: data.formData.preliminaryProceedings,
        toxicological_report: data.formData.toxicologicalReport,
        death_cause: data.formData.deathCause,
        body_build: data.formData.bodyBuild,
        judged: data.formData.judged,
        acquisition_year: data.formData.acquisitionYear,
      };

      const updatedPubisData: Partial<Pubis> = {};
      if (
        this.existingPubis.laterality === 'left' &&
        data.formData.leftPreservationStatus
      ) {
        updatedPubisData.preservation_state =
          data.formData.leftPreservationStatus;
      } else if (
        this.existingPubis.laterality === 'right' &&
        data.formData.rightPreservationStatus
      ) {
        updatedPubisData.preservation_state =
          data.formData.rightPreservationStatus;
      }

      // Filtra archivos nuevos
      const filterNewFiles = (files: File[], type: '2D' | '3D') =>
        files.filter(
          file =>
            !this.existingPubis!.digitalModels?.some(
              dm =>
                dm.model_type === type &&
                dm.files?.some(f => f.name === file.name)
            )
        );

      const newLeft2DFiles = filterNewFiles(leftFiles2D, '2D');
      const newRight2DFiles = filterNewFiles(rightFiles2D, '2D');
      const newLeft3DFiles = filterNewFiles(leftFiles3D, '3D');
      const newRight3DFiles = filterNewFiles(rightFiles3D, '3D');

      // Actualiza Subject y Pubis
      this.subjectService
        .updateSubject(this.existingSubject.id!, updatedSubjectData)
        .subscribe({
          next: () => {
            this.pubisService
              .updatePubis(this.existingPubis!.id!, updatedPubisData)
              .subscribe({
                next: () => {
                  // Añade archivos a DigitalModels (lo crea si no existe)
                  const addFilesToModel = (
                    files: File[],
                    type: '2D' | '3D'
                  ) => {
                    if (!files.length) return;

                    let model = this.existingPubis!.digitalModels?.find(
                      dm => dm.model_type === type
                    );
                    if (!model) {
                      model = { model_type: type, files: [] };
                      this.existingPubis!.digitalModels =
                        this.existingPubis!.digitalModels || [];
                      this.existingPubis!.digitalModels.push(model);
                    }

                    model.files = model.files || [];
                    model.files.push(...files);
                  };

                  addFilesToModel(newLeft2DFiles, '2D');
                  addFilesToModel(newRight2DFiles, '2D');
                  addFilesToModel(newLeft3DFiles, '3D');
                  addFilesToModel(newRight3DFiles, '3D');

                  this.uploadAndCreateModels(
                    this.existingSubject!.shortId!,
                    [this.existingPubis!],
                    newLeft2DFiles,
                    newRight2DFiles,
                    newLeft3DFiles,
                    newRight3DFiles
                  ).finally(() => {
                    this.loadAllPubis();
                    this.showNewSampleDialog = false;
                    this.isEditMode = false;
                  });
                },
                error: err => console.error('Error al actualizar Pubis:', err),
              });
          },
          error: err => console.error('Error al actualizar Subject:', err),
        });
    }

    if (this.selectedRadio === 'addNewSample') {
      const pubisData: Pubis[] = [];
      this.extractPubisData(data, pubisData);
      const subjectData: Subject = this.createSubjectData(data);

      this.showNewSampleDialog = false;
      this.showInfoDialog = true;

      this.subjectService.createSubject(subjectData).subscribe({
        next: createdSubject => {
          // Después de crear el Subject, se crea e Pubis
          this.handlePubisCreation(pubisData, createdSubject)
            .then(createdPubisArray => {
              // Subimos los archivos 3D y 2D y creamos los modelos
              return this.uploadAndCreateModels(
                createdSubject.shortId!,
                createdPubisArray,
                leftFiles2D,
                rightFiles2D,
                leftFiles3D,
                rightFiles3D
              );
            })
            .catch(err => {
              console.error(
                'Error en la creación de Pubis o en la subida de archivos:',
                err
              );
            })
            .finally(() => {
              // Llamamos a la función para cargar los Pubis después de la creación
              this.loadAllPubis();
            });
        },
        error: err => {
          console.error('Error al crear el Subject:', err);
        },
      });
    } else if (this.selectedRadio === 'addMultipleSamples') {
      const excelData = data.excelData;
      const headers = excelData[0];
      const subjectsArray: Subject[] = [];
      const subjectIds: number[] = excelData
        .slice(1)
        .map((row: any[]) => row[0]);
      const allPubisData: Pubis[][] = this.extractPubisDataFromExcel(excelData);

      const { leftFolderNames, rightFolderNames } = this.extractFolderNames(
        data.filesHistory
      );
      const idFolderMatches = this.checkFolderIdMatches(
        subjectIds,
        leftFolderNames,
        rightFolderNames
      );

      for (let i = 1; i < excelData.length; i++) {
        const row = excelData[i];
        const subject: Subject = this.mapRowToSubject(headers, row);
        const tempId = subject.id;

        delete subject.id;

        (subject as any)._tempId = tempId;

        subjectsArray.push(subject);
      }

      this.createMultipleSubjectsWithFiles(
        subjectsArray,
        allPubisData,
        idFolderMatches,
        data.filesHistory
      );
    }
  }

  createMultipleSubjectsWithFiles(
    subjects: Subject[],
    allPubisData: Pubis[][],
    idFolderMatches: { id: number; matchingFolders: string[] }[],
    filesHistory: { leftFiles: File[]; rightFiles: File[] }[]
  ) {
    if (!filesHistory || filesHistory.length === 0) {
      console.error('filesHistory está vacío o no definido');
      return;
    }
    const checks = subjects.map(subject => {
      const tempId = (subject as any)._tempId;

      return this.subjectService
        .checkIfExists(tempId)
        .pipe(map(response => (response.exists ? null : subject)));
    });

    forkJoin(checks).subscribe(results => {
      const subjectsToCreate = results.filter(
        (subject): subject is Subject => subject !== null
      );

      const createRequests = subjectsToCreate.map((subject, index) => {
        const pubisDataForSubject = allPubisData[index] || [];
        const tempId = (subject as any)._tempId;
        const matchingFolders =
          idFolderMatches.find(match => match.id === tempId)?.matchingFolders ||
          [];
        const leftFiles2D: File[] = [];
        const rightFiles2D: File[] = [];
        const leftFiles3D: File[] = [];
        const rightFiles3D: File[] = [];

        matchingFolders.forEach(folderName => {
          let folderLeftFiles: File[] = [];
          let folderRightFiles: File[] = [];
          let localFound2D = false;

          filesHistory.forEach(history => {
            folderLeftFiles = history.leftFiles.filter(file =>
              file.webkitRelativePath.includes(folderName)
            );
            folderRightFiles = history.rightFiles.filter(file =>
              file.webkitRelativePath.includes(folderName)
            );

            if (folderLeftFiles.length > 0 || folderRightFiles.length > 0) {
              if (!localFound2D) {
                leftFiles2D.push(...folderLeftFiles);
                rightFiles2D.push(...folderRightFiles);
                localFound2D = true;
              } else {
                leftFiles3D.push(...folderLeftFiles);
                rightFiles3D.push(...folderRightFiles);
              }
            }
          });
        });

        return this.subjectService.createSubject(subject).pipe(
          switchMap(async createdSubject => {
            return this.handlePubisCreation(
              pubisDataForSubject,
              createdSubject
            ).then(createdPubisArray => {
              return this.uploadAndCreateModels(
                createdSubject.shortId!,
                createdPubisArray,
                leftFiles2D,
                rightFiles2D,
                leftFiles3D,
                rightFiles3D
              );
            });
          })
        );
      });

      //Ejecuta todas las solicitudes de creación en paralelo
      forkJoin(createRequests).subscribe(
        () => {
          // Llamamos a la función para recargar los Pubis después de la creación
          this.loadAllPubis;
        },
        error => {
          console.error(
            'Ocurrió un error al crear sujetos, pubis o modelos:',
            error
          );
        }
      );
    });
  }

  checkFolderIdMatches(
    subjectIds: number[],
    leftFolderNames: string[],
    rightFolderNames: string[]
  ): { id: number; matchingFolders: string[] }[] {
    const matches: { id: number; matchingFolders: string[] }[] = [];

    subjectIds.forEach(id => {
      const idPattern = new RegExp(`\\b${id}\\b`);
      const matchingFolders: string[] = [];

      leftFolderNames.forEach(folder => {
        if (idPattern.test(folder)) matchingFolders.push(folder);
      });

      rightFolderNames.forEach(folder => {
        if (idPattern.test(folder)) matchingFolders.push(folder);
      });

      if (matchingFolders.length > 0) {
        matches.push({ id, matchingFolders });
      }
    });

    return matches;
  }

  extractFolderNames(filesHistory: any[]): {
    leftFolderNames: string[];
    rightFolderNames: string[];
  } {
    const leftFolderNames: string[] = [];
    const rightFolderNames: string[] = [];

    filesHistory.forEach(history => {
      history.leftFiles.forEach((file: { webkitRelativePath: string }) => {
        const folderName = file.webkitRelativePath.split('/')[1];
        if (!leftFolderNames.includes(folderName))
          leftFolderNames.push(folderName);
      });

      history.rightFiles.forEach((file: { webkitRelativePath: string }) => {
        const folderName = file.webkitRelativePath.split('/')[1];
        if (!rightFolderNames.includes(folderName))
          rightFolderNames.push(folderName);
      });
    });

    return { leftFolderNames, rightFolderNames };
  }

  extractPubisDataFromExcel(excelData: any[]): Pubis[][] {
    const allPubisData: Pubis[][] = [];

    // Iterar sobre cada fila del Excel, comenzando desde la fila 1 (índice 1)
    for (let i = 1; i < excelData.length; i++) {
      const row = excelData[i];
      const pubisData: Pubis[] = [];

      // Variables para almacenar la lateridad y el estado de preservación
      const rightLaterality = row[6]; // Cambia según el índice real
      const rightPreservationStatus = row[7]; // Cambia según el índice real
      const leftLaterality = row[8]; // Cambia según el índice real
      const leftPreservationStatus = row[9]; // Cambia según el índice real

      // Verifica y agrega pubis derecho
      if (rightLaterality === 'yes') {
        pubisData.push({
          laterality: 'right',
          preservation_state: rightPreservationStatus || 'Unknown',
        });
      }

      // Verifica y agrega pubis izquierdo
      if (leftLaterality === 'yes') {
        pubisData.push({
          laterality: 'left',
          preservation_state: leftPreservationStatus || 'Unknown',
        });
      }

      allPubisData.push(pubisData); // Añade el pubisData específico para este sujeto
    }

    // Muestra los datos extraídos en la consola
    console.log('Datos de Pubis extraídos del Excel:', allPubisData);
    return allPubisData;
  }

  createMultipleSubjects(subjects: Subject[], allPubisData: Pubis[][]) {
    const checks = subjects.map(subject => {
      if (subject.id === undefined) {
        return of(null);
      }

      return this.subjectService
        .checkIfExists(subject.id)
        .pipe(map(response => (response.exists ? null : subject)));
    });

    forkJoin(checks).subscribe(results => {
      const subjectsToCreate = results.filter(
        (subject): subject is Subject => subject !== null
      );

      const createRequests = subjectsToCreate.map((subject, index) => {
        const pubisDataForSubject = allPubisData[index] || []; // Obtener el pubisData específico para este sujeto
        return this.subjectService.createSubject(subject).pipe(
          switchMap(createdSubject => {
            return this.handlePubisCreation(
              pubisDataForSubject,
              createdSubject
            );
          })
        );
      });

      forkJoin(createRequests).subscribe(
        createResults => {
          createResults.forEach((createdPubisArray, index) => {
            if (createdPubisArray.length === 0) {
              console.log(
                `No se crearon Pubis para el sujeto: ${subjectsToCreate[index].id}`
              );
            }
          });

          if (createResults.length === 0) {
            console.log('No se crearon nuevos sujetos, todos ya existen.');
          }
        },
        error => {
          console.error('Ocurrió un error al crear algunos Pubis:', error);
        }
      );
    });
  }

  mapRowToSubject(headers: string[], row: (string | number)[]): Subject {
    const subject: Partial<Subject> = {};

    headers.forEach((header, index) => {
      const subjectKey = this.columnMapping[header];
      if (subjectKey) {
        const value = row[index];

        // Verifica si la clave es `biological_age_at_death` o `id` para convertirlos a números
        if (subjectKey === 'biological_age_at_death') {
          subject[subjectKey] =
            value !== null && value !== undefined ? Number(value) : 0; // Valor predeterminado si es `null`
          // Si la clave es `acquisition_year`, convierte el valor a `Date`
        } else if (subjectKey === 'acquisition_year') {
          if (
            typeof value === 'number' ||
            (typeof value === 'string' && !isNaN(Number(value)))
          ) {
            // Si `value` es un año, lo convertimos a una fecha completa: 1 de enero de ese año
            subject[subjectKey] = new Date(Number(value), 0, 1); // Mes 0 = enero
          } else {
            console.warn(
              `El valor de 'acquisition_year' no es válido: ${value}`
            );
            subject[subjectKey] = null;
          }
        } else {
          subject[subjectKey] = value as string;
        }
      }
    });

    return subject as Subject;
  }

  // Función para extraer los datos del pubis
  extractPubisData(data: any, pubisData: Pubis[]) {
    if (
      data.formData.rightLaterality === 'yesR' &&
      data.formData.rightPreservationStatus
    ) {
      const pubisDataRight: Pubis = {
        laterality: 'right',
        preservation_state: data.formData.rightPreservationStatus,
      };
      pubisData.push(pubisDataRight);
    }

    if (
      data.formData.leftLaterality === 'yesL' &&
      data.formData.leftPreservationStatus
    ) {
      const pubisDataLeft: Pubis = {
        laterality: 'left',
        preservation_state: data.formData.leftPreservationStatus,
      };
      pubisData.push(pubisDataLeft);
    }
  }

  // Función para crear datos de Subject
  createSubjectData(data: any): Subject {
    return {
      id: data.formData.id,
      name: data.formData.name,
      lastname: data.formData.lastname,
      biological_age_at_death: data.formData.biologicalAgeAtDeath,
      acquisition_year: data.formData.boneAcquisition,
      body_build: data.formData.build,
      death_cause: data.formData.causeOfDeath,
      judged: data.formData.courtEvaluation,
      preliminary_proceedings: data.formData.preliminaryProceedings,
      sex: data.formData.sex,
      toxicological_report: data.formData.toxicologicalReport,
    };
  }

  async handlePubisCreation(
    pubisData: Pubis[],
    createdSubject: Subject
  ): Promise<Pubis[]> {
    console.log(this.collectionId);
    const pubisPromises = pubisData.map(async pubis => {
      try {
        pubis.subject = createdSubject;

        const savedPubis = await this.pubisService
          .createPubis(pubis)
          .toPromise();

        if (!savedPubis || !savedPubis.id) {
          throw new Error('Failed to save Pubis or Pubis ID is undefined');
        }

        if (this.collectionId !== null) {
          const collection = await this.collectionService
            .getByShortId(this.collectionId)
            .toPromise();
          console.log(collection);
          if (!collection || !collection.id) {
            throw new Error(
              `No se encontró la colección con shortId ${this.collectionId}`
            );
          }

          await this.collectionPubisService
            .createRelation(collection.id, savedPubis.id)
            .toPromise();
        }

        return savedPubis;
      } catch (error) {
        console.error('Error creando pubis o relación:', error);
        throw error;
      }
    });

    // Esperamos a que terminen todas las promesas
    return Promise.all(pubisPromises).then(results => {
      const createdPubisArray = results.filter(
        (pubis): pubis is Pubis => pubis !== undefined
      );

      if (createdPubisArray.length < pubisData.length) {
        throw new Error('Error en la creación de uno o más pubis');
      }

      return createdPubisArray;
    });
  }

  async uploadAndCreateModels(
    createdSubjectId: string,
    createdPubisArray: Pubis[],
    leftFiles2D: File[],
    rightFiles2D: File[],
    leftFiles3D: File[],
    rightFiles3D: File[]
  ): Promise<void> {
    const uploadPromises: Promise<void>[] = [];

    const handleUpload = async (
      filesLeft: File[],
      filesRight: File[],
      is3D: boolean
    ) => {
      const modelType: '2D' | '3D' = is3D ? '3D' : '2D';
      const allFiles = [...filesLeft, ...filesRight];
      if (!allFiles.length) return;

      const relativePaths = allFiles.map(f => f.webkitRelativePath || f.name);

      try {
        const response = await this.uploadService
          .uploadFiles(allFiles, is3D, relativePaths, createdSubjectId)
          .toPromise();

        const urls = response.urls;

        for (const pubis of createdPubisArray) {
          const isRight = pubis.laterality === 'right';
          const relevantFiles = isRight ? filesRight : filesLeft;
          if (!relevantFiles.length) continue;

          // Ver si ya existe un modelo en la BD
          let existingModel = pubis.digitalModels?.find(
            dm => dm.model_type === modelType
          );

          // Si no tenemos id, traemos de la BD
          if (!existingModel?.id) {
            try {
              const modelsFromDb = await this.digitalModelService
                .getByPubisId(pubis.id!)
                .toPromise();
              existingModel = modelsFromDb!.find(
                dm => dm.model_type === modelType
              );
            } catch (err) {
              console.warn(
                ` No se pudo cargar modelos del pubis ${pubis.id}:`,
                err
              );
            }
          }

          if (existingModel?.id) {
            await this.addFilesToExistingDigitalModel(
              existingModel,
              relevantFiles,
              urls
            );
          } else {
            console.log(`🆕 Creando nuevo modelo ${modelType}`);
            await this.createDigitalModelWithFiles(
              modelType,
              pubis,
              relevantFiles,
              urls
            );
          }
        }
      } catch (err) {
        console.error(`Error al subir archivos ${modelType}:`, err);
      }
    };

    uploadPromises.push(handleUpload(leftFiles2D, rightFiles2D, false));
    uploadPromises.push(handleUpload(leftFiles3D, rightFiles3D, true));

    await Promise.all(uploadPromises);
  }

  private async addFilesToExistingDigitalModel(
    existingModel: DigitalModel,
    newFiles: File[],
    urls: { name: string; url: string }[]
  ): Promise<void> {
    if (!existingModel.id) {
      return;
    }

    const filesToCreate = newFiles.filter((file, i) => {
      const url = urls[i]?.url;
      const alreadyExists = existingModel.files?.some(
        f => f.name === file.name || (url && f.link === url)
      );
      return !alreadyExists;
    });

    // Crea objetos MyFile solo para los que no existen
    const myNewFiles: MyFile[] = filesToCreate.map((file, i) => ({
      name: file.name,
      link: urls[i].url,
      digitalModel: { id: existingModel.id } as DigitalModel,
    }));

    console.log('Archivos a crear en BD:', myNewFiles);

    // Crea cada archivo en la BD de forma secuencial
    for (const myFile of myNewFiles) {
      try {
        await this.fileService.createFile(myFile).toPromise();
        console.log(
          `Archivo ${myFile.name} añadido al modelo ${existingModel.model_type}`
        );
      } catch (err) {
        console.error(`Error al añadir archivo ${myFile.name}:`, err);
      }
    }
  }

  // Función para crear modelos digitales y asociar archivos
  createDigitalModelWithFiles(
    modelType: '2D' | '3D',
    createdPubis: Pubis,
    files: File[],
    urls: { name: string; url: string }[]
  ) {
    const digitalModel: DigitalModel = {
      model_type: modelType,
      acquisition_date: new Date(),
      pubis: createdPubis,
    };

    this.digitalModelService
      .createDigitalModel(digitalModel)
      .toPromise()
      .then(createdDigitalModel => {
        files.forEach(file => {
          let urlObj;
          if (file.name.endsWith('.obj')) {
            const gltfName = file.name.replace('.obj', '.gltf');
            urlObj = urls.find(url => url.name === gltfName);
          } else {
            urlObj = urls.find(url => url.name === file.name);
          }
          if (urlObj) {
            const myFile: MyFile = {
              name: urlObj.name, // Usamos el nombre modificado
              link: urlObj.url,
              digitalModel: createdDigitalModel,
            };

            this.fileService
              .createFile(myFile)
              .toPromise()
              .then(() => {
                console.log(
                  `Archivo ${file.name} creado en la base de datos y asociado al modelo ${modelType}:`,
                  myFile
                );
              })
              .catch((error: any) => {
                console.error(
                  'Error al crear el archivo en la base de datos:',
                  error
                );
              });
          } else {
            console.warn(`No se encontró URL para el archivo ${file.name}.`);
          }
        });
      })
      .catch(error => {
        console.error(`Error al crear el modelo digital ${modelType}:`, error);
      });
  }

  delete() {
    if (!this.existingPubis?.id) {
      console.error(' No hay un Pubis seleccionado para eliminar.');
      return;
    }

    this.pubisService.deletePubis(this.existingPubis.id).subscribe({
      next: () => {
        // Recarga la lista o actualiza el estado
        this.loadAllPubis();
        this.closeDialog();
      },
      error: err => {
        console.error('Error al eliminar el Pubis:', err);
      },
    });
  }

  onRadioButtonChange(value: string) {
    this.selectedRadio = value;

    this.translate.get('PUBIS_DIALOGS').subscribe((translations: any) => {
      if (!this.newDialogConfig?.stepsContent?.[1]) return;

      if (value === 'addNewSample') {
        this.newDialogConfig.stepsContent[1].formConfig = this.newSampleForm;
        this.newDialogConfig.stepsContent[1].showForm = true;
        this.newDialogConfig.stepsContent[1].text =
          translations['FILL_FORM_PUBIS'];
        this.newDialogConfig.stepsContent[1].showUpload = false;
      } else if (value === 'addMultipleSamples') {
        this.newDialogConfig.stepsContent[1].showForm = false;
        this.newDialogConfig.stepsContent[1].isExcelUpload = true;
        this.newDialogConfig.stepsContent[1].text =
          translations['SELECT_EXCEL_TO_IMPORT'];
        this.newDialogConfig.stepsContent[1].showUpload = true;
      }

      this.cdr.detectChanges();
    });
  }

  get filteredPubis(): Pubis[] {
    const term = this.searchTerm.toLowerCase().trim();
    return this.allPubisData.filter(
      pubis =>
        pubis.shortId?.toLowerCase().includes(term) ||
        pubis.laterality.toLowerCase().includes(term) ||
        pubis.subject?.shortId?.toLowerCase().includes(term)
    );
  }
}
