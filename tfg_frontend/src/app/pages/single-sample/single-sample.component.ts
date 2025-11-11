import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';
import { TableComponent } from '../../components/table/table.component';
import { Pubis } from '../../models/pubis';
import { ColumnsConfig } from '../../components/table/table';
import { CollectionApiService } from '../../services/collection-service.service';
import { Collection } from '../../models/collection';
import { PubisService } from '../../services/pubis.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { PubisLabelService } from '../../services/pubis-label.service';
import { PubisLabel } from '../../models/pubis-label.model';
import { MatButtonModule } from '@angular/material/button';
import { PubisViewerComponent } from '../../components/pubis-viewer/pubis-viewer.component';
import { LabellingService } from '../../services/labelling.service';
import { Label } from '../../models/label';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../services/auth.service';
import { UserApiService } from '../../services/user-api.service';
import { map, switchMap } from 'rxjs';
import { ComponentPortal, PortalModule } from '@angular/cdk/portal';
import { OverlayModule } from 'primeng/overlay';
import { MathjaxTooltipComponent } from '../../components/tooltip-math/tooltip-math.component';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { AGE_FORMULA } from '../../utils/formulas';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type CombinedLabelPubis = {
  labelId: string;
  labelDate: string;
  pubisShortId: string;
  subjectShortId: string;
};

const formatter = new Intl.DateTimeFormat('default', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
});

@UntilDestroy()
@Component({
  selector: 'app-single-sample',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    MatButtonModule,
    PubisViewerComponent,
    MatProgressBarModule,
    OverlayModule,
    PortalModule,
    MathjaxTooltipComponent,
    TranslateModule,
  ],
  templateUrl: './single-sample.component.html',
  styleUrl: './single-sample.component.scss',
})
export class SingleSampleComponent implements OnInit {
  private userId: string | null = null;
  private overlayRef: OverlayRef | null = null;

  tableData: (Collection | Pubis | PubisLabel | CombinedLabelPubis)[] = [];
  tableConfig: ColumnsConfig[] = [];

  selectedCollection: Collection | null = null;
  currentView: 'collections' | 'pubis' = 'collections';
  selectedRow?: CombinedLabelPubis;
  selectedLabel?: Label;
  isAnalyzing: boolean = false;
  prediction: string | null = null;
  estimatedAge: string | null = null;

  @ViewChild('estimatedAgeLabel', { read: ElementRef })
  estimatedAgeLabel!: ElementRef;

  labelData: ColumnsConfig[] = [
    { title: 'Label ID', apiField: 'labelId' },
    { title: 'Label Date', apiField: 'labelDate' },
    { title: 'Pubis ID', apiField: 'pubisShortId' },
    { title: 'Subject ID', apiField: 'subjectShortId' },
  ];
  collectionData: ColumnsConfig[] = [
    { title: 'ID', apiField: 'shortId' },
    { title: 'Collection name', apiField: 'name' },
  ];

  constructor(
    private collectionService: CollectionApiService,
    private cdr: ChangeDetectorRef,
    private pubisService: PubisService,
    private pubisLabelService: PubisLabelService,
    private labelService: LabellingService,
    private authService: AuthService,
    private userService: UserApiService,
    private overlay: Overlay,
    private translate: TranslateService
  ) {}

  private updateColumnsTranslations(): void {
    this.translate
      .get([
        'ID',
        'COLLECTION_NAME',
        'PUBIS_SHORT_ID',
        'SUBJECT_ID',
        'LABEL_ID',
        'LABEL_DATE',
      ])
      .subscribe(translations => {
        if (this.currentView === 'collections') {
          this.collectionData = [
            { title: translations['ID'], apiField: 'shortId' },
            { title: translations['COLLECTION_NAME'], apiField: 'name' },
          ];
          this.tableConfig = this.collectionData;
        } else if (this.currentView === 'pubis') {
          this.labelData = [
            { title: translations['LABEL_ID'], apiField: 'labelId' },
            { title: translations['LABEL_DATE'], apiField: 'labelDate' },
            { title: translations['PUBIS_SHORT_ID'], apiField: 'pubisShortId' },
            { title: translations['SUBJECT_ID'], apiField: 'subjectShortId' },
          ];
          this.tableConfig = this.labelData;
        }

        this.cdr.detectChanges();
      });
  }

  showTooltip() {
    if (this.overlayRef) return;

    const positionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.estimatedAgeLabel)
      .withPositions([
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -8,
          offsetX: -10,
        },
      ]);

    this.overlayRef = this.overlay.create({ positionStrategy });
    const tooltipPortal = new ComponentPortal(MathjaxTooltipComponent);
    const tooltipRef = this.overlayRef.attach(tooltipPortal);
    tooltipRef.instance.formula = AGE_FORMULA;
  }

  hideTooltip() {
    if (this.overlayRef) {
      this.overlayRef.dispose();
      this.overlayRef = null;
    }
  }
  ngOnInit(): void {
    this.updateColumnsTranslations();

    this.authService
      .getUserEmail()
      .pipe(
        switchMap(email => {
          if (!email) throw new Error('No se encontró el email del usuario');
          return this.userService.getUserByEmail(email);
        }),
        untilDestroyed(this)
      )
      .subscribe({
        next: user => {
          if (!user?.id)
            return console.error('El usuario no tiene un ID válido.');
          this.userId = user.id;
          this.loadCollections();
        },
        error: err => console.error('Error al obtener usuario:', err),
      });

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateColumnsTranslations();
      this.cdr.detectChanges();
    });
  }

  loadCollections(): void {
    this.collectionService.getCollections().subscribe({
      next: collections => {
        this.tableData = collections;
        this.tableConfig = this.collectionData;
        this.currentView = 'collections';
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading collections:', err);
      },
    });
  }

  openPubis(item: Collection | Pubis | PubisLabel | CombinedLabelPubis): void {
    if (!this.isCollection(item)) return;

    this.selectedCollection = item;
    const collectionId = item.shortId;

    this.pubisService
      .getPubisByCollection(collectionId!)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: pubisList => {
          const enrichedPubisList = pubisList.map(pubis => ({
            ...pubis,
            subjectShortId: pubis.subject?.shortId ?? null,
          }));
          const pubisIds = enrichedPubisList
            .map(p => p.id)
            .filter((id): id is string => typeof id === 'string');

          this.pubisLabelService
            .getLabelsByPubisIds(pubisIds, this.userId)
            .pipe(untilDestroyed(this))
            .subscribe({
              next: labels => {
                // Combinamos los datos:
                const combined = labels.map(label => {
                  return {
                    labelId: label.label.id,
                    labelDate: formatter.format(new Date(label.createdAt)),
                    pubisShortId: label.pubis?.shortId ?? '',
                    subjectShortId: label.pubis?.subject?.shortId ?? '',
                  };
                });

                this.tableData = combined;

                this.tableConfig = this.labelData;
                this.currentView = 'pubis';
                this.cdr.detectChanges();
              },
              error: err => {
                console.error('Error al obtener etiquetas:', err);
              },
            });
        },
        error: err => {
          console.error('Error al obtener los pubis por colección:', err);
        },
      });
  }

  async analyze(): Promise<void> {
    if (this.isAnalyzing || !this.selectedRow?.labelId) {
      return;
    }

    this.isAnalyzing = true;

    this.labelService
      .createFileARFF(this.selectedRow.labelId)
      .pipe(
        switchMap(prediction =>
          this.labelService
            .estimateAge(this.selectedRow!.labelId)
            .pipe(map(ageResult => ({ prediction, ageResult })))
        ),
        untilDestroyed(this)
      )
      .subscribe({
        next: ({ prediction, ageResult }) => {
          this.prediction = prediction.prediction[0]?.prediction || null;

          if (ageResult?.results) {
            this.estimatedAge = ageResult.results[0].age?.toString() ?? null;
          } else {
            console.warn('No se encontraron resultados en ageResult');
          }

          this.isAnalyzing = false;
        },
        error: () => {
          this.isAnalyzing = false;
        },
      });
  }

  goBack(): void {
    this.selectedCollection = null;
    this.loadCollections();
  }

  isCollection(item: any): item is Collection {
    return (item as Collection).name !== undefined;
  }

  handleSelected(item: any): void {
    if (!item) return;
    if (this.currentView === 'pubis') {
      this.prediction = null;
      this.selectedRow = item;
      if (this.selectedRow?.labelId) {
        this.labelService
          .getLabelsById(this.selectedRow.labelId)
          .pipe(untilDestroyed(this))
          .subscribe({
            next: label => {
              this.selectedLabel = label;
              this.cdr.detectChanges();
            },
            error: err => {
              console.error('Error al obtener label:', err);
            },
          });
      } else {
        console.warn('No labelId disponible en la fila seleccionada');
      }
      this.cdr.detectChanges();
    }
  }

  isPubis(item: any): item is Pubis {
    return !!item && 'laterality' in item;
  }
}
