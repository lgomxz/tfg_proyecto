import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ColumnsConfig } from '../../components/table/table';
import { Cohen } from '../../utils/cohens_kappa';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { WizardStepperComponent } from '../../components/wizard-stepper/wizard-stepper.component';
import { TableComponent } from '../../components/table/table.component';
import { Step } from '../../models/step';
import { CollectionApiService } from '../../services/collection-service.service';
import { PubisService } from '../../services/pubis.service';
import { PubisLabelService } from '../../services/pubis-label.service';
import { UserApiService } from '../../services/user-api.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin, switchMap, map } from 'rxjs';
import { CommonModule } from '@angular/common';
import { PubisLabel } from '../../models/pubis-label.model';
import { LabellingService } from '../../services/labelling.service';
import { SubjectService } from '../../services/subject.service';
import { TabViewModule } from 'primeng/tabview';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { SpinnerLoaderComponent } from '../../components/spinner-loader/spinner-loader.component';
import { ChartModule } from 'primeng/chart';

interface AgeEstimationItem {
  labelId: string;
  estimatedAge: number | null;
  practitionerAge: number | null;
  realAge: number | null;
}

interface ConfusionMatrixData {
  phases: string[];
  matrix: number[][];
  accuracyPerPhase: number[];
  recallPerPhase: number[];
  overallAccuracy: number;
  rowTotals: number[];
  colTotals: number[];
  grandTotal: number;
}

@UntilDestroy()
@Component({
  selector: 'app-experiments',
  standalone: true,
  imports: [
    WizardStepperComponent,
    TableComponent,
    CommonModule,
    TabViewModule,
    TranslateModule,
    SpinnerLoaderComponent,
    ChartModule,
  ],
  templateUrl: './experiments.component.html',
  styleUrls: ['./experiments.component.scss'],
})
export class ExperimentsComponent implements OnInit {
  cohen = new Cohen();
  ageEstimationResult: any;

  stepsData: Step[] = [];
  selectedOption: string | null = null;
  selectedAgeOption: 'phase' | 'numeric' | null = null;
  selectedCollections: any[] = [];
  private userId: string | null = null;
  analysisType: 'intra' | 'inter' | 'all' | null = null;
  isLoading: boolean = false;
  comparisonData: { real: string; predicted: string; forense: string }[] = [];

  confusionMatrixData: ConfusionMatrixData | null = null;

  allLabels: any[] = [];
  filteredLabels: any[] = [];
  filterType: 'all' | 'intra' | 'inter' = 'all';
  selectedLabels: PubisLabel[] = [];

  finalResultsTableData: any[] = [];
  showFinalTable = false;
  tableColumns: { title: string; apiField: string }[] = [];

  @ViewChild('stepper') stepper!: WizardStepperComponent;
  @ViewChild('optionTemplate', { static: true })
  optionTemplate!: TemplateRef<any>;
  @ViewChild('filterTemplate', { static: true })
  filterTemplate!: TemplateRef<any>;
  @ViewChild('ageSubOptionsTemplate', { static: true })
  ageSubOptionsTemplate!: TemplateRef<any>;

  errorMetrics: {
    iaVsReal?: {
      mae: number;
      minError: number;
      maxError: number;
      mse: number;
      stdDev: number;
    };
    practitionerVsReal?: {
      mae: number;
      minError: number;
      maxError: number;
      mse: number;
      stdDev: number;
    };
  } = {};

  scatterOptions = {
    responsive: true,
    plugins: {
      legend: { display: true },
    },
    scales: {
      x: { title: { display: true, text: 'Real' } },
      y: { title: { display: true, text: 'Predicted' } },
    },
  };

  tableConfig: ColumnsConfig[] = [
    { title: 'ID', apiField: 'shortId' },
    { title: 'Collection name', apiField: 'name' },
  ];
  comparisonTableConfig = [
    { title: 'Fase IA (Predicha)', apiField: 'predicted' },
    { title: 'Fase Forense', apiField: 'forense' },
    { title: 'Fase Real', apiField: 'real' },
  ];

  labelsTableConfig: ColumnsConfig[] = [
    { title: 'Pubis Short ID', apiField: 'pubisShortId' },
    { title: 'Label Date', apiField: 'labelDate', isDate: true },
    { title: 'Label ID', apiField: 'labelId' },
    { title: 'User', apiField: 'user' },
  ];

  // Categorías para cada atributo
  attributeCategories: Record<string, string[]> = {
    auricular_face_ridges_and_grooves: [
      'RegularPorosity',
      'RidgesAndGrooves',
      'GroovesShallow',
      'GroovesRest',
      'NoGrooves',
    ],
    auricular_face_irregular_pososity: ['Absence', 'Medium', 'Much'],
    upper_symphyseal_extremity_definition: ['NotDefined', 'Defined'],
    upper_symphyseal_extremity_bony_nodule: ['Absent', 'Present'],
    lower_symphyseal_extremity_definition: ['NotDefined', 'Defined'],
    dorsal_groove_definition: ['Absent', 'Present', 'Closed'],
    dorsal_groove_dorsal_plateau: ['Absent', 'Present'],
    ventral_margin_ventral_bevel: ['Absent', 'InProcess', 'Present'],
    ventral_margin_ventral_margin: [
      'Absent',
      'PartiallyFormed',
      'FormedWithoutRarefactions',
      'FormedWitFewRarefactions',
      'FormedWithLotRecessesAndProtrusions',
    ],
  };

  constructor(
    private collectionApi: CollectionApiService,
    private pubisService: PubisService,
    private pubisLabelService: PubisLabelService,
    private labelService: LabellingService,
    private subjectService: SubjectService,
    private userService: UserApiService,
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private translate: TranslateService
  ) {}

  private updateColumnsTranslations() {
    this.translate
      .get([
        'ID',
        'COLLECTION_NAME',
        'PHASE_IA_PREDICTED',
        'PHASE_FORENSIC',
        'PHASE_REAL',
        'PUBIS_SHORT_ID',
        'LABEL_DATE',
        'LABEL_ID',
        'USER',
      ])
      .subscribe((translations: any) => {
        // Table config
        this.tableConfig = [
          { title: translations['ID'], apiField: 'shortId' },
          { title: translations['COLLECTION_NAME'], apiField: 'name' },
        ];

        // Comparison table config
        this.comparisonTableConfig = [
          { title: translations['PHASE_IA_PREDICTED'], apiField: 'predicted' },
          { title: translations['PHASE_FORENSIC'], apiField: 'forense' },
          { title: translations['PHASE_REAL'], apiField: 'real' },
        ];

        // Labels table config
        this.labelsTableConfig = [
          { title: translations['PUBIS_SHORT_ID'], apiField: 'pubisShortId' },
          {
            title: translations['LABEL_DATE'],
            apiField: 'labelDate',
            isDate: true,
          },
          { title: translations['LABEL_ID'], apiField: 'labelId' },
          { title: translations['USER'], apiField: 'user' },
        ];

        this.cdRef.detectChanges();
      });
  }

  private updateFeatureTableColumns(pairs: string[]) {
    this.translate
      .get(['MAIN_PART', 'DETAIL', 'GLOBAL_MATCH', 'KAPPA'])
      .subscribe(translations => {
        this.tableColumns = [
          { title: translations['MAIN_PART'], apiField: 'mainPart' },
          { title: translations['DETAIL'], apiField: 'detail' },
          { title: translations['GLOBAL_MATCH'], apiField: 'matchPercentage' },
          ...pairs.map(pair => ({
            title: `${translations['KAPPA']} ${pair.replace('_vs_', ' vs ')}`,
            apiField: pair,
          })),
        ];
        this.cdRef.detectChanges();
      });
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
          if (!user?.id) return;
          this.userId = user.id;
        },
        error: err => console.error('Error al obtener usuario:', err),
      });

    this.collectionApi.getCollections().subscribe({
      next: collections => {
        this.stepsData = [
          {
            title: 'TITLES.COLLECTIONS_STEP',
            component: TableComponent,
            data: {
              tableData: collections,
              tableConfig: this.tableConfig,
              showActions: false,
              hasCheckboxColumn: true,
              selectedRows: this.selectedCollections,
              selectionChange: this.onSelectionChange.bind(this),
            },
            canAdvance: () => this.selectedCollections.length > 0,
          },
          {
            title: 'TITLES.CHOOSE_ANALYSIS',
            content: this.optionTemplate,
            canAdvance: () => !!this.selectedOption,
          },
          { title: 'TITLES.ANALYSIS_OPTIONS', content: undefined },
        ];
      },
      error: err => console.error('Error loading collections', err),
    });

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateColumnsTranslations();

      if (this.stepsData?.length) {
        this.stepsData = this.stepsData.map(step => {
          if (step.component === TableComponent) {
            return {
              ...step,
              data: {
                ...step.data,
                tableConfig: this.tableConfig, // nuevo array con traducciones
              },
            };
          }
          return step;
        });
        this.cdRef.detectChanges();
      }
    });
  }

  attributeGroups = {
    'Auricular face': ['Ridges and grooves', 'Irregular porosity'],
    'Upper symphyseal extremity': ['Definition', 'Bony nodule'],
    'Lower symphyseal extremity': ['Definition'],
    'Dorsal groove': ['Definition', 'Dorsal plateau'],
    'Ventral margin': ['Ventral bevel', 'Ventral margin'],
  };

  handleFinish(): void {
    if (this.selectedOption === 'features') {
      this.processFeaturesAnalysis();
    } else if (
      this.selectedOption === 'age' &&
      this.selectedAgeOption === 'phase'
    ) {
      this.analyzePhaseForSelectedLabels(this.selectedLabels);
    } else if (
      this.selectedOption === 'age' &&
      this.selectedAgeOption === 'numeric'
    ) {
      this.analyzeAgeForSelectedLabels(this.selectedLabels);
    }
  }

  private analyzeAgeForSelectedLabels(labels: any[]): void {
    if (!labels || labels.length === 0) {
      console.warn('No hay etiquetas seleccionadas para análisis de edad.');
      return;
    }

    const labelIds = labels.map(label => label.labels.id);
    const pubisShortId =
      labels[0].pubisShortId ?? labels[0].pubis?.shortId ?? '';

    if (!pubisShortId) {
      console.warn('No se encontró pubisShortId en las etiquetas.');
      return;
    }

    this.isLoading = true;

    this.labelService
      .createFileARFF(labelIds)
      .pipe(
        switchMap(() => this.labelService.estimateAge(labelIds)),
        switchMap(ageResult =>
          this.pubisService.getSubjectShortIdByPubisShortId(pubisShortId).pipe(
            switchMap(({ subjectShortId }) =>
              this.subjectService.getBiologicalAgeAtDeath(subjectShortId).pipe(
                map(({ biological_age_at_death }) => ({
                  ageResult,
                  biologicalAgeAtDeath: biological_age_at_death,
                }))
              )
            )
          )
        ),
        untilDestroyed(this)
      )
      .subscribe({
        next: ({ ageResult, biologicalAgeAtDeath }) => {
          this.ageEstimationResult = ageResult.results.map(res => {
            const labelOriginal = labels.find(
              l => l.labels.shortId === res.labelId
            );

            const practitionerPhase =
              labelOriginal?.labels?.toddPhasePractitioner ?? null;
            const practitionerAge = practitionerPhase
              ? this.getMidAgeForPhase(practitionerPhase)
              : null;

            return {
              labelId: res.labelId,
              estimatedAge: res.age, // Edad IA
              practitionerAge: practitionerAge, // Edad media por fase
              realAge: biologicalAgeAtDeath, // Edad real
            };
          });
          this.calculateErrorMetrics();

          this.isLoading = false;
        },
        error: err => {
          console.error('Error en análisis de edad:', err);
          this.isLoading = false;
        },
      });
    this.showFinalTable = true;
  }

  private calculateErrorMetrics() {
    if (!this.ageEstimationResult) return;

    const iaVsReal: number[] = [];
    const practitionerVsReal: number[] = [];

    this.ageEstimationResult.forEach((item: AgeEstimationItem) => {
      if (item.estimatedAge != null && item.realAge != null) {
        iaVsReal.push(item.estimatedAge - item.realAge);
      }
      if (item.practitionerAge != null && item.realAge != null) {
        practitionerVsReal.push(item.practitionerAge - item.realAge);
      }
    });

    function getMetrics(errors: number[]) {
      const absErrors = errors.map(e => Math.abs(e));
      const mse = errors.reduce((sum, e) => sum + e ** 2, 0) / errors.length;
      const mae = absErrors.reduce((sum, e) => sum + e, 0) / absErrors.length;
      const maxError = Math.max(...absErrors);
      const minError = Math.min(...absErrors);
      const stdDev =
        Math.sqrt(
          absErrors.reduce((sum, e) => sum + (e - mae) ** 2, 0) /
            absErrors.length
        ) || 0;
      return { mse, mae, maxError, minError, stdDev };
    }

    this.errorMetrics.iaVsReal = getMetrics(iaVsReal);
    this.errorMetrics.practitionerVsReal = getMetrics(practitionerVsReal);
  }

  private buildConfusionMatrix(data: { real: string; predicted: string }[]) {
    const phases = this.phaseRanges.map(p => p.code);
    const matrix: number[][] = Array.from({ length: phases.length }, () =>
      Array(phases.length).fill(0)
    );

    data.forEach(item => {
      const row = phases.indexOf(item.real);
      const col = phases.indexOf(item.predicted);
      if (row !== -1 && col !== -1) {
        matrix[row][col]++;
      }
    });

    // Totales por fila (real)
    const rowTotals = matrix.map(row => row.reduce((a, b) => a + b, 0));

    // Totales por columna (predicho)
    const colTotals = phases.map((_, colIndex) =>
      matrix.reduce((sum, row) => sum + row[colIndex], 0)
    );

    // Total general
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

    // Precision (accuracyPerPhase): TP / (TP + FP)
    const accuracyPerPhase = phases.map((_, i) => {
      const tp = matrix[i][i];
      const fp = colTotals[i] - tp;
      const denominator = tp + fp;
      return denominator > 0 ? tp / denominator : 0;
    });

    // Recall (recallPerPhase): TP / (TP + FN)
    const recallPerPhase = phases.map((_, i) => {
      const tp = matrix[i][i];
      const fn = rowTotals[i] - tp;
      const denominator = tp + fn;
      return denominator > 0 ? tp / denominator : 0;
    });

    // Accuracy global: suma de TP / total
    const totalCorrect = phases.reduce((sum, _, i) => sum + matrix[i][i], 0);
    const overallAccuracy = grandTotal > 0 ? totalCorrect / grandTotal : 0;

    return {
      phases,
      matrix,
      accuracyPerPhase,
      recallPerPhase,
      overallAccuracy,
      rowTotals,
      colTotals,
      grandTotal,
    };
  }

  private analyzePhaseForSelectedLabels(labels: any[]): void {
    if (!labels || labels.length === 0) {
      console.warn(' No hay etiquetas seleccionadas para análisis de edad.');
      return;
    }

    const labelIds = labels.map(label => label.labels.id);
    const pubisShortId =
      labels[0].pubisShortId ?? labels[0].pubis?.shortId ?? '';

    if (!pubisShortId) {
      console.warn(' No se encontró pubisShortId en las etiquetas.');
      return;
    }

    this.isLoading = true;

    this.labelService
      .createFileARFF(labelIds)
      .pipe(
        switchMap(prediction =>
          this.labelService
            .estimateAge(labelIds)
            .pipe(map(ageResult => ({ prediction, ageResult })))
        ),
        switchMap(({ prediction, ageResult }) =>
          this.pubisService.getSubjectShortIdByPubisShortId(pubisShortId).pipe(
            switchMap(({ subjectShortId }) =>
              this.subjectService.getBiologicalAgeAtDeath(subjectShortId).pipe(
                map(({ biological_age_at_death }) => ({
                  prediction,
                  ageResult,
                  biologicalAgeAtDeath: biological_age_at_death,
                }))
              )
            )
          )
        ),
        untilDestroyed(this)
      )
      .subscribe({
        next: ({ prediction, biologicalAgeAtDeath }) => {
          // Calculamos la fase real según la edad biológica de muerte
          const phaseCode = this.getPhaseFromAge(biologicalAgeAtDeath);

          // Construimos un array con la predicción IA, fase anotador y fase real
          const comparisonData = prediction.prediction.map(p => {
            // Buscar etiqueta usando labels.id, no labelId directamente
            const label = labels.find(l => l.labels.shortId === p.labelId);

            const forensePhase =
              label?.labels?.toddPhasePractitioner ?? 'Unknown';

            const result = {
              real: phaseCode ?? 'Unknown',
              predicted: p.prediction || 'Unknown',
              forense: forensePhase,
            };

            return result;
          });
          this.comparisonData = comparisonData;

          // Construimos la matriz de confusión usando esos datos
          const {
            phases,
            matrix,
            accuracyPerPhase,
            recallPerPhase,
            overallAccuracy,
            rowTotals,
            colTotals,
            grandTotal,
          } = this.buildConfusionMatrix(comparisonData);

          this.confusionMatrixData = {
            phases,
            matrix,
            accuracyPerPhase,
            recallPerPhase,
            overallAccuracy,
            rowTotals,
            colTotals,
            grandTotal,
          };

          this.showFinalTable = true;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        },
      });
  }

  private phaseRanges = [
    { code: 'Ph01-19', min: 0, max: 19 },
    { code: 'Ph02-20-21', min: 20, max: 21 },
    { code: 'Ph03-22-24', min: 22, max: 24 },
    { code: 'Ph04-25-26', min: 25, max: 26 },
    { code: 'Ph05-27-30', min: 27, max: 30 },
    { code: 'Ph06-31-34', min: 31, max: 34 },
    { code: 'Ph07-35-39', min: 35, max: 39 },
    { code: 'Ph08-40-44', min: 40, max: 44 },
    { code: 'Ph09-45-49', min: 45, max: 49 },
    { code: 'Ph10-50-', min: 50, max: Infinity },
  ];

  private getPhaseFromAge(age: number): string {
    const phase = this.phaseRanges.find(p => age >= p.min && age <= p.max);
    return phase ? phase.code : 'Unknown';
  }
  private getMidAgeForPhase(phaseCode: string): number | null {
    const phase = this.phaseRanges.find(p => p.code === phaseCode);
    if (!phase) return null;

    // Casos especiales
    if (phase.code === 'Ph01-19') return 15; // Adolescente joven
    if (phase.code === 'Ph10-50-') return 60; // Adulto mayor

    // Punto medio genérico
    if (isFinite(phase.max)) {
      return Math.round((phase.min + phase.max) / 2);
    }

    return null; // Por si acaso hay otra fase sin max definido
  }

  private processFeaturesAnalysis(): void {
    if (!this.selectedLabels || this.selectedLabels.length === 0) {
      console.warn('⚠️ No hay etiquetas disponibles para calcular kappa.');
      return;
    }

    const uniqueUsers = new Set(
      this.selectedLabels.map(label => label.user).filter(Boolean)
    );

    let groupedLabels: Record<string, any[]>;

    // Determinar tipo de análisis
    if (uniqueUsers.size === 1) {
      this.analysisType = 'intra';
      groupedLabels = this.groupLabelsBySession(this.selectedLabels);
    } else if (uniqueUsers.size > 1) {
      this.analysisType = 'inter';
      groupedLabels = this.groupLabelsByUser(this.selectedLabels);
    } else {
      console.warn(
        '⚠️ No se pudo determinar si calcular intra o inter-observador.'
      );
      return;
    }

    // Calcular Kappa por pares
    const resultsKappa = this.calculateKappaByGroup(groupedLabels) as Record<
      string,
      Record<string, number | null>
    >;

    // Calcular % coincidencia global por atributo
    const globalMatchRates = this.calculateGlobalMatchRate(
      groupedLabels
    ) as Record<string, number | null>;

    const pairs = Object.keys(resultsKappa);

    // Estructura fija de atributos
    const attributeGroups: Record<string, string[]> = {
      'Auricular face': [
        'Auricular face',
        'Ridges and grooves',
        'Irregular porosity',
      ],
      'Upper symphyseal extremity': [
        'Upper symphyseal extremity',
        'Bony nodule',
      ],
      'Lower symphyseal extremity': ['Lower symphyseal extremity'],
      'Dorsal groove': ['Dorsal groove', 'Dorsal plateau'],
      'Ventral margin': ['Ventral bevel', 'Ventral margin'],
    };

    // Mapeo de nombres visibles → claves internas
    const keyMapping: Record<string, string> = {
      'Auricular face': 'auricular_face',
      'Ridges and grooves': 'auricular_face_ridges_and_grooves',
      'Irregular porosity': 'auricular_face_irregular_pososity',
      'Upper symphyseal extremity': 'upper_symphyseal_extremity',
      'Bony nodule': 'upper_symphyseal_extremity_bony_nodule',
      'Lower symphyseal extremity': 'lower_symphyseal_extremity',
      'Dorsal groove': 'dorsal_groove',
      'Dorsal plateau': 'dorsal_groove_dorsal_plateau',
      'Ventral bevel': 'ventral_margin_ventral_bevel',
      'Ventral margin': 'ventral_margin_ventral_margin',
    };

    const tableRows: any[] = [];

    // Construir tabla con formato deseado
    for (const [mainPart, details] of Object.entries(attributeGroups)) {
      details.forEach((detail, i) => {
        const attrKey = keyMapping[detail];

        const row: any = {
          mainPart: i === 0 ? mainPart : '', // Solo mostrar el nombre en la primera fila del grupo
          detail: detail,
          matchPercentage:
            globalMatchRates[attrKey] !== null &&
            globalMatchRates[attrKey] !== undefined
              ? globalMatchRates[attrKey]!.toFixed(2) + '%'
              : 'N/A',
        };

        // Kappa por par
        for (const pair of pairs) {
          const kappa = resultsKappa[pair]?.[attrKey];
          row[pair] =
            kappa !== null && kappa !== undefined ? kappa.toFixed(3) : 'N/A';
        }

        tableRows.push(row);
      });
    }

    this.finalResultsTableData = tableRows;

    this.updateFeatureTableColumns(pairs);

    this.showFinalTable = true;
    this.cdRef.detectChanges();

    // Suscripción a cambio de idioma
    this.translate.onLangChange
      .pipe(untilDestroyed(this))
      .subscribe(() => this.updateFeatureTableColumns(pairs));
  }

  onLabelSelectionChange(selected: PubisLabel[]) {
    this.selectedLabels = selected;
    this.cdRef.detectChanges();
  }

  onStepChanged(newStepIndex: number) {
    // Si la opción seleccionada es 'features', quita el paso 4
    if (
      newStepIndex === 2 &&
      this.selectedOption === 'features' &&
      this.stepsData.length > 3
    ) {
      this.stepsData = this.stepsData.slice(0, 3);
      this.cdRef.detectChanges();
    }
  }

  onSelectionChange(selectedRows: any[]) {
    this.selectedCollections = selectedRows;
  }

  onOptionSelect(option: string) {
    this.selectedOption = option;

    if (option === 'features') {
      // Quitar paso 4
      if (this.stepsData.length > 3) {
        this.stepsData = this.stepsData.slice(0, 3);
      }
      this.loadLabelsForSelectedCollections();
    } else if (option === 'age') {
      this.setupStepThreeForAge();

      // Agregar paso 4 (vacío o con datos iniciales)
      const step: Step = {
        title: 'TITLES.LABEL_TABLE',
        content: this.filterTemplate,
      };

      if (this.stepsData.length === 3) {
        this.stepsData = [...this.stepsData, step];
      } else {
        const newSteps = [...this.stepsData];
        newSteps[3] = step;
        this.stepsData = newSteps;
      }

      this.cdRef.detectChanges();
    }
  }

  onAgeOptionSelect(option: 'phase' | 'numeric') {
    this.selectedAgeOption = option;
    this.loadLabelsForSelectedCollections();

    if (this.stepsData.length > 3) {
      const newSteps = [...this.stepsData];
      newSteps[3].data = {
        labels: this.filteredLabels,
        tableConfig: this.labelsTableConfig,
        data: {
          selectionChange: this.onSelectionChange.bind(this),
        },
        canAdvance: this.selectedAgeOption,
      };
      newSteps[3].canAdvance = () => !!this.selectedAgeOption;
    }

    this.cdRef.detectChanges();
  }

  setupStepThreeForFeatures() {
    const stepThree = this.stepsData[2];
    stepThree.title = 'Intra/Inter Observer Filter';
    stepThree.content = this.filterTemplate;
    stepThree.data = {
      labels: this.filteredLabels,
      tableConfig: this.labelsTableConfig,
    };
    stepThree.canAdvance = () => this.selectedLabels.length > 0;
  }

  setupStepThreeForAge() {
    const stepThree = this.stepsData[2];
    stepThree.title = 'Age Options';
    stepThree.content = this.ageSubOptionsTemplate;
    stepThree.data = null;
    stepThree.canAdvance = () => !!this.selectedAgeOption;
  }

  onFilterChange(filter: 'all' | 'intra' | 'inter') {
    this.filterType = filter;
    this.applyFilter();
    const stepThree = this.stepsData[2];
    if (stepThree) {
      stepThree.data = {
        labels: this.filteredLabels,
        tableConfig: this.labelsTableConfig,
      };
    }
  }

  applyFilter() {
    this.filteredLabels =
      this.filterType === 'all'
        ? [...this.allLabels]
        : this.allLabels.filter(
            label => label.intraInterObserver === this.filterType
          );
  }

  determineObserverType(userId?: string): 'intra' | 'inter' {
    if (!userId || !this.userId) return 'inter';
    return userId === this.userId ? 'intra' : 'inter';
  }

  loadLabelsForSelectedCollections() {
    if (!this.selectedCollections.length) return;
    const collectionRequests = this.selectedCollections.map(c =>
      this.pubisService.getPubisByCollection(c.shortId)
    );
    forkJoin(collectionRequests)
      .pipe(
        switchMap(pubisArrays => {
          const allPubis = pubisArrays.flat();
          const pubisIds = allPubis
            .map(p => p.id)
            .filter((id): id is string => !!id);
          return this.pubisLabelService
            .getLabelsByPubisIds(pubisIds, null)
            .pipe(
              map(labels => {
                this.allLabels = labels.map(label => ({
                  pubisShortId: label.pubis?.shortId ?? '',
                  labelDate: new Date(label.createdAt).toISOString(),
                  labelId: label.id,
                  labelShortId: label.label.shortId,
                  labels: label.label,
                  user: `${label.user?.name ?? ''} ${label.user?.lastname ?? ''}`.trim(),
                  intraInterObserver: this.determineObserverType(
                    label.user?.id
                  ),
                  pubisId: label.pubis?.id ?? '',
                }));
                this.applyFilter();
                if (this.selectedOption === 'features') {
                  this.setupStepThreeForFeatures();
                }
                return this.allLabels;
              })
            );
        })
      )
      .subscribe({
        error: err => console.error('Error fetching labels:', err),
      });
  }

  private groupLabelsBySession(labels: any[]): Record<string, any[]> {
    const map: Record<string, any[]> = {};
    for (const label of labels) {
      if (!label.labelDate) continue;
      const date = new Date(label.labelDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const semester = month <= 6 ? 1 : 2;
      const sessionKey = `${year}-S${semester}`;
      if (!map[sessionKey]) map[sessionKey] = [];
      map[sessionKey].push(label);
    }
    return map;
  }

  checkPubisAlignment(
    session1: any[],
    session2: any[],
    sessionKey1: string,
    sessionKey2: string
  ) {
    const pubis1 = session1.map(label => label.pubisShortId);
    const pubis2 = session2.map(label => label.pubisShortId);

    let aligned = true;
    const misalignedIndices = [];

    const minLen = Math.min(pubis1.length, pubis2.length);
    for (let i = 0; i < minLen; i++) {
      if (pubis1[i] !== pubis2[i]) {
        aligned = false;
        misalignedIndices.push({
          index: i,
          pubis1: pubis1[i],
          pubis2: pubis2[i],
        });
      }
    }

    if (aligned) {
      console.log('Las anotaciones están alineadas por pubis en orden.');
    } else {
      console.log(
        'Las anotaciones NO están alineadas. Diferencias encontradas en:'
      );
      misalignedIndices.forEach(({ index, pubis1, pubis2 }) => {
        console.log(
          `  Posición ${index}: ${sessionKey1} tiene ${pubis1}, ${sessionKey2} tiene ${pubis2}`
        );
      });
    }

    // Mostrar pubis que están en una sesión y no en otra
    //   const set1 = new Set(pubis1);
    //   const set2 = new Set(pubis2);

    //   const onlyIn1 = pubis1.filter(p => !set2.has(p));
    //   const onlyIn2 = pubis2.filter(p => !set1.has(p));

    //   if (onlyIn1.length > 0) {
    //     console.log(`Pubis solo en ${sessionKey1}:`, onlyIn1);
    //   }
    //   if (onlyIn2.length > 0) {
    //     console.log(`Pubis solo en ${sessionKey2}:`, onlyIn2);
    //   }
  }

  private getSortedAttributeValuesBySession(
    session: any[],
    attr: string,
    validValues: string[]
  ): string[] {
    const pubisMap: Record<string, any[]> = {};

    for (const label of session) {
      if (!label.pubisShortId) continue;
      if (!pubisMap[label.pubisShortId]) {
        pubisMap[label.pubisShortId] = [];
      }
      pubisMap[label.pubisShortId].push(label);
    }

    const sortedValues: string[] = [];

    const sortedPubis = Object.keys(pubisMap).sort();
    for (const pubis of sortedPubis) {
      const annotations = pubisMap[pubis].sort(
        (a, b) =>
          new Date(a.labelDate).getTime() - new Date(b.labelDate).getTime()
      );

      for (const label of annotations) {
        const val = label.labels?.[attr];
        if (val !== undefined && validValues.includes(val)) {
          sortedValues.push(val);
        }
      }
    }

    return sortedValues;
  }

  private groupLabelsByUser(labels: any[]): Record<string, any[]> {
    const map: Record<string, any[]> = {};
    for (const label of labels) {
      const userId = label.user;
      if (!userId || !label.labelDate) continue;
      if (!map[userId]) map[userId] = [];
      map[userId].push(label);
    }

    // Ordena cada grupo por fecha
    for (const userId in map) {
      map[userId].sort(
        (a, b) =>
          new Date(a.labelDate).getTime() - new Date(b.labelDate).getTime()
      );
    }

    return map;
  }

  private calculateKappaByGroup(
    groupMap: Record<string, any[]>
  ): Record<string, Record<string, number | null>> {
    const groups = Object.entries(groupMap).sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    if (groups.length < 2) {
      console.warn(' No hay al menos 2 grupos para comparar');
      return {};
    }

    const pairResults: Record<string, Record<string, number | null>> = {};
    const attributes = Object.keys(this.attributeCategories);

    for (let i = 0; i < groups.length - 1; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const key1 = groups[i][0];
        const key2 = groups[j][0];
        const labels1 = groups[i][1];
        const labels2 = groups[j][1];
        const pairKey = `${key1}_vs_${key2}`;

        const kappaResults: Record<string, number | null> = {};

        for (const attr of attributes) {
          const categories = this.attributeCategories[attr];
          const values1 = this.getSortedAttributeValuesBySession(
            labels1,
            attr,
            categories
          );
          const values2 = this.getSortedAttributeValuesBySession(
            labels2,
            attr,
            categories
          );
          const len = Math.min(values1.length, values2.length);

          if (len === 0) {
            console.warn(` No hay datos comparables para ${attr}`);
            kappaResults[attr] = null;
            continue;
          }

          const aligned1 = values1.slice(0, len);
          const aligned2 = values2.slice(0, len);

          try {
            const dict1: { [key: string]: string } = {};
            const dict2: { [key: string]: string } = {};
            for (let k = 0; k < len; k++) {
              dict1[`item${k}`] = aligned1[k];
              dict2[`item${k}`] = aligned2[k];
            }

            const num1 = this.cohen.nominalConversion(categories, dict1);
            const num2 = this.cohen.nominalConversion(categories, dict2);
            const kappa = this.cohen.kappa(
              num1,
              num2,
              categories.length,
              'linear'
            );

            kappaResults[attr] =
              typeof kappa === 'number' && !isNaN(kappa) ? kappa : null;
          } catch (err) {
            console.error(`Error calculando kappa para ${attr}:`, err);
            kappaResults[attr] = null;
          }
        }

        pairResults[pairKey] = kappaResults;
      }
    }

    return pairResults;
  }

  calculateGlobalMatchRate(
    groupedLabels: Record<string, any[]>
  ): Record<string, number | null> {
    const groupEntries = Object.entries(groupedLabels);

    if (groupEntries.length < 2) {
      console.warn(
        'Se requieren al menos 2 grupos para calcular match rate.'
      );
      return {};
    }

    const attributes = Object.keys(this.attributeCategories);
    const totalMatches: Record<string, number> = {};
    const totalComparisons: Record<string, number> = {};

    attributes.forEach(attr => {
      totalMatches[attr] = 0;
      totalComparisons[attr] = 0;
    });

    for (let i = 0; i < groupEntries.length - 1; i++) {
      for (let j = i + 1; j < groupEntries.length; j++) {
        const groupA = groupEntries[i][1];
        const groupB = groupEntries[j][1];

        // Pubis en común
        const pubisEnComun = new Set(
          groupA
            .map(l => l.pubisShortId)
            .filter(id => groupB.some(lb => lb.pubisShortId === id))
        );

        for (const pubisId of pubisEnComun) {
          const labelsA = groupA.filter(l => l.pubisShortId === pubisId);
          const labelsB = groupB.filter(l => l.pubisShortId === pubisId);

          for (const la of labelsA) {
            for (const lb of labelsB) {
              for (const attr of attributes) {
                const valA = la.labels?.[attr];
                const valB = lb.labels?.[attr];

                if (valA !== undefined && valB !== undefined) {
                  totalComparisons[attr]++;
                  if (valA === valB) {
                    totalMatches[attr]++;
                  }
                }
              }
            }
          }
        }
      }
    }

    // Calcular %
    const result: Record<string, number | null> = {};
    for (const attr of attributes) {
      result[attr] =
        totalComparisons[attr] > 0
          ? (totalMatches[attr] / totalComparisons[attr]) * 100
          : null;
    }

    return result;
  }

  preparePhaseScatterData(): any {
    if (!this.comparisonData) return { datasets: [] };

    const phaseOrder: Record<string, number> = {};
    this.phaseRanges.forEach((p, idx) => {
      phaseOrder[p.code] = idx + 1;
    });

    const datasetPoints = this.comparisonData
      .map(d => {
        const x = phaseOrder[d.real] ?? null;
        const y = phaseOrder[d.predicted] ?? null;
        if (x == null || y == null) return null;
        return { x, y };
      })
      .filter(Boolean);

    // Generar línea diagonal (y = x)
    const maxPhase = this.phaseRanges.length;
    const diagonalPoints = Array.from({ length: maxPhase }, (_, i) => ({
      x: i + 1,
      y: i + 1,
    }));

    return {
      datasets: [
        {
          label: 'Phase Predicted vs Real',
          data: datasetPoints,
          backgroundColor: '#d6005c',
          borderColor: '#d6005c',
          showLine: false,
          pointRadius: 5,
        },
        {
          label: 'Perfect Match',
          data: diagonalPoints,
          borderColor: '#000000',
          borderWidth: 1,
          fill: false,
          showLine: true,
          pointRadius: 0, // no mostrar puntos, solo línea
        },
      ],
      options: {
        scales: {
          x: {
            ticks: {
              callback: function (value: any) {
                const phase = Object.entries(phaseOrder).find(
                  ([, v]) => v === value
                );
                return phase ? phase[0] : value;
              },
            },
            title: {
              display: true,
              text: 'Real Phase',
            },
          },
          y: {
            ticks: {
              callback: function (value: any) {
                const phase = Object.entries(phaseOrder).find(
                  ([, v]) => v === value
                );
                return phase ? phase[0] : value;
              },
            },
            title: {
              display: true,
              text: 'Predicted Phase',
            },
          },
        },
      },
    };
  }
  prepareAgeScatterData(): { datasets: any[] } {
    if (!this.ageEstimationResult || this.ageEstimationResult.length === 0) {
      return { datasets: [] };
    }

    const datasetPoints = this.ageEstimationResult
      .map((d: { realAge: number | null; estimatedAge: number | null }) => {
        if (d.realAge == null || d.estimatedAge == null) return null;
        return { x: d.realAge, y: d.estimatedAge };
      })
      .filter(
        (p: { x: number; y: number } | null): p is { x: number; y: number } =>
          p !== null
      );

    const allAges = datasetPoints.flatMap((p: { x: number; y: number }) => [
      p.x,
      p.y,
    ]);
    const minAge = Math.min(...allAges);
    const maxAge = Math.max(...allAges);

    const diagonalPoints = [
      { x: minAge, y: minAge },
      { x: maxAge, y: maxAge },
    ];

    return {
      datasets: [
        {
          label: 'Age Predicted vs Real',
          data: datasetPoints,
          backgroundColor: '#d6005c',
          borderColor: '#d6005c',
          showLine: false,
          pointRadius: 5,
        },
        {
          label: 'Perfect Match',
          data: diagonalPoints,
          borderColor: '#000000',
          borderWidth: 1,
          fill: false,
          showLine: true,
          pointRadius: 0,
        },
      ],
    };
  }
}
