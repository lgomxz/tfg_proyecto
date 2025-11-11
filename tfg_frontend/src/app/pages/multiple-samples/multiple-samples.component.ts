import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
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
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../services/auth.service';
import { UserApiService } from '../../services/user-api.service';
import { map, switchMap } from 'rxjs';
import { Label } from '../../models/label';
import { SpinnerLoaderComponent } from '../../components/spinner-loader/spinner-loader.component';
import { ExcelService } from '../../services/excel.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type CombinedLabelPubis = {
  labelId: string;
  labelShortId: string;
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
  selector: 'app-multiple-samples',
  standalone: true,
  imports: [
    CommonModule,
    TableComponent,
    MatButtonModule,
    PubisViewerComponent,
    MatProgressBarModule,
    SpinnerLoaderComponent,
    TranslateModule,
  ],
  templateUrl: './multiple-samples.component.html',
  styleUrl: './multiple-samples.component.scss',
})
export class MultipleSamplesComponent implements OnInit {
  private userId: string | null = null;

  tableData: (Collection | Pubis | PubisLabel | CombinedLabelPubis)[] = [];
  tableConfig: ColumnsConfig[] = [];

  selectedCollection: Collection | null = null;
  currentView: 'collections' | 'pubis' = 'collections';
  selectedRow?: CombinedLabelPubis;
  selectedLabel?: Label;
  predictions: {
    labelId: string;
    prediction: string | null;
    estimatedAge?: string;
  }[] = [];

  selectedPubis: CombinedLabelPubis[] = [];
  isLoading: boolean = false;

  labelData: ColumnsConfig[] = [
    { title: 'Etiqueta ID', apiField: 'labelShortId' },
    { title: 'Fecha etiqueta', apiField: 'labelDate' },
    { title: 'Pubis ID', apiField: 'pubisShortId' },
    { title: 'Subject ID', apiField: 'subjectShortId' },
  ];

  collectionData: ColumnsConfig[] = [
    { title: 'ID', apiField: 'shortId' },
    { title: 'Collection Name', apiField: 'name' },
  ];

  predictionsConfig: ColumnsConfig[] = [
    { title: 'Label ID', apiField: 'labelId' },
    { title: 'Prediction', apiField: 'prediction' },
    { title: 'Estimated age', apiField: 'estimatedAge' },
  ];

  constructor(
    private collectionService: CollectionApiService,
    private cdr: ChangeDetectorRef,
    private pubisService: PubisService,
    private pubisLabelService: PubisLabelService,
    private labelService: LabellingService,
    private authService: AuthService,
    private userService: UserApiService,
    private excelService: ExcelService,
    private translate: TranslateService
  ) {}

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

  private updateColumnsTranslations(): void {
    this.translate
      .get([
        'ID',
        'COLLECTION_NAME',
        'PUBIS_SHORT_ID',
        'SUBJECT_ID',
        'LABEL_ID',
        'LABEL_DATE',
        'PREDICTION',
        'ESTIMATED_AGE_COLUMN',
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

        this.predictionsConfig = [
          { title: translations['LABEL_ID'], apiField: 'labelId' },
          { title: translations['PREDICTION'], apiField: 'prediction' },
          {
            title: translations['ESTIMATED_AGE_COLUMN'],
            apiField: 'estimatedAge',
          },
        ];

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
                const combined = labels.map(label => {
                  return {
                    labelId: label.label.id,
                    labelShortId: label.label.shortId ?? '',
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

  goBack(): void {
    this.selectedCollection = null;
    this.loadCollections();
  }

  isCollection(item: any): item is Collection {
    return (item as Collection).name !== undefined;
  }
  onSelectedRowsChange(
    selectedRows: (Collection | Pubis | PubisLabel | CombinedLabelPubis)[]
  ): void {
    if (!selectedRows) return;

    const newSelectedPubis = selectedRows.filter(
      this.isCombinedLabelPubis
    ) as CombinedLabelPubis[];

    // Añadir nuevos
    for (const item of newSelectedPubis) {
      const exists = this.selectedPubis.some(p => p.labelId === item.labelId);
      if (!exists) {
        this.selectedPubis.push(item);
      }
    }

    // Quitar los que ya no están seleccionados
    this.selectedPubis = this.selectedPubis.filter(p =>
      newSelectedPubis.some(n => n.labelId === p.labelId)
    );

    // Si hay una colección seleccionada (y fue seleccionada ahora), cargar sus pubis
    for (const item of selectedRows) {
      if (this.isCollection(item)) {
        const collectionId = item.shortId;
        this.pubisService
          .getPubisByCollection(collectionId!)
          .pipe(untilDestroyed(this))
          .subscribe({
            next: pubisList => {
              const pubisIds = pubisList
                .map(p => p.id)
                .filter((id): id is string => !!id);

              this.pubisLabelService
                .getLabelsByPubisIds(pubisIds, this.userId)
                .pipe(untilDestroyed(this))
                .subscribe({
                  next: labels => {
                    const combined = labels.map(label => ({
                      labelId: label.label.id,
                      labelShortId: label.label.shortId,
                      labelDate: formatter.format(new Date(label.createdAt)),
                      pubisShortId: label.pubis?.shortId ?? '',
                      subjectShortId: label.pubis?.subject?.shortId ?? '',
                    }));

                    for (const c of combined) {
                      if (
                        !this.selectedPubis.find(p => p.labelId === c.labelId)
                      ) {
                        this.selectedPubis.push(c);
                      }
                    }
                  },
                  error: err => {
                    console.error('Error obteniendo etiquetas:', err);
                  },
                });
            },
            error: err => {
              console.error('Error obteniendo pubis:', err);
            },
          });
      }
    }
  }

  handleSelected(item: any): void {
    if (!item) return;

    if (this.currentView === 'pubis') {
      this.selectedRow = item;

      if (this.selectedRow?.labelId) {
        this.labelService
          .getLabelsById(this.selectedRow.labelId)
          .pipe(untilDestroyed(this))
          .subscribe({
            next: label => {
              this.selectedLabel = label;
              this.cdr.detectChanges(); // fuerza el render
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

  isCombinedLabelPubis(item: any): item is CombinedLabelPubis {
    return item && 'labelId' in item && 'pubisShortId' in item;
  }

  analyzeAll(rows: CombinedLabelPubis[]): void {
    this.isLoading = true;

    const labelIds = rows.map(r => r.labelId);

    this.labelService
      .createFileARFF(labelIds)
      .pipe(
        switchMap(prediction =>
          this.labelService
            .estimateAge(labelIds)
            .pipe(map(ageResult => ({ prediction, ageResult })))
        ),
        untilDestroyed(this)
      )
      .subscribe({
        next: ({ prediction, ageResult }) => {
          const ages = ageResult?.results || [];

          // Crea un mapa labelId -> age
          const ageMap = new Map<string, number | null>(
            ages.map(r => [r.labelId, r.age])
          );

          // Combinar predicción con edad
          this.predictions = prediction.prediction.map(p => {
            const age = ageMap.get(p.labelId);
            return {
              labelId: p.labelId,
              prediction: p.prediction || 'N/A',
              estimatedAge:
                age !== undefined && age !== null
                  ? age.toFixed(2)
                  : 'Unestimated age',
            };
          });

          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  exportToExcel(): void {
    const data = this.predictions.map(p => ({
      labelId: p.labelId,
      prediction: p.prediction || '',
      estimatedAge: p.estimatedAge || '',
    }));
    this.excelService.downloadExcel(data);
  }
}
