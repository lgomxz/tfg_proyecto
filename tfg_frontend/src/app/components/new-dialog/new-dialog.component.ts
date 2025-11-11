import {
  Component,
  EventEmitter,
  Input,
  Output,
  ChangeDetectorRef,
  SimpleChanges,
  OnChanges,
  OnInit,
  ViewChild,
  ViewContainerRef,
  ComponentRef,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DialogConfig } from './dialog';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { StepsModule } from 'primeng/steps';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormComponent } from '../form/form.component';
import { UploadFilesComponent } from '../upload-files/upload-files.component';
import { CollectionFormConfig } from '../form/form';
import { CheckboxModule } from 'primeng/checkbox';
import { MatButtonModule } from '@angular/material/button';
import { GenericSelectorComponent } from '../generic-selector/generic-selector.component';

@Component({
  selector: 'app-new-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    RadioButtonModule,
    StepsModule,
    FormComponent,
    UploadFilesComponent,
    MatButtonModule,
    CheckboxModule,
    GenericSelectorComponent,
  ],
  templateUrl: './new-dialog.component.html',
  styleUrls: ['./new-dialog.component.scss'],
})
export class NewDialogComponent implements OnInit, OnChanges {
  @Input() visible: boolean = false;
  @Input() formConfig: DialogConfig = {
    header: '',
    stepsContent: [],
    buttons: [],
  };

  // Archivos existentes cargados previamente
  @Input() existingFiles: { '2D': File[]; '3D': File[] } | null = null;
  @Input() searchPlaceholder?: string;

  // Eventos emitidos hacia el componente padre
  @Output() acceptForm = new EventEmitter<any>();
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter();
  @Output() radioChange: EventEmitter<string> = new EventEmitter();
  @Output() selectionChanged = new EventEmitter<any[]>();

  // Referencia al contenedor dinámico donde se inyectarán los componentes de upload
  @ViewChild('uploadContainer', { read: ViewContainerRef })
  uploadContainer!: ViewContainerRef;

  form!: FormGroup;
  steps: any[] = [];
  activeStepIndex: number = 0;
  selectedRadio: string = '';
  uploadKey: number = 0;
  uploadComponents: ComponentRef<UploadFilesComponent>[] = [];
  customSelectedItems: any[] = [];
  filesHistory: { leftFiles: any[]; rightFiles: any[] }[] = [];
  excelData: any[] = [];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initializeStepper();
    this.initializeForm();

    // Inicializa componente de upload si el primer paso lo requiere
    if (this.formConfig.stepsContent?.[this.activeStepIndex]?.showUpload) {
      this.initializeUploadComponent(this.activeStepIndex);
    }

    this.cdr.detectChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formConfig'] && !changes['formConfig'].firstChange) {
      this.initializeStepper();
      this.activeStepIndex = 0;
      this.selectedRadio = '';
      this.initializeForm();

      // Si hay archivos existentes, los guarda en el historial
      if (this.existingFiles) {
        this.filesHistory[2] = {
          leftFiles: this.existingFiles['2D'] || [],
          rightFiles: [],
        };
        this.filesHistory[3] = {
          leftFiles: [],
          rightFiles: this.existingFiles['3D'] || [],
        };
      }

      // Crear el componente de subida
      if (this.formConfig.stepsContent?.[this.activeStepIndex]?.showUpload) {
        this.initializeUploadComponent(this.activeStepIndex);
      }

      this.cdr.detectChanges();
    }

    // Si hay archivos existentes los clasifica y los pasa al componente de subida
    if (this.existingFiles && this.formConfig?.stepsContent) {
      this.formConfig.stepsContent.forEach((step, index) => {
        if (step.showUpload) {
          if (!this.uploadComponents[index]) {
            this.initializeUploadComponent(index);
          }

          const uploadComp = this.uploadComponents[index];
          if (!uploadComp) return;

          const is3D = step.imageType === '3D';
          uploadComp.instance.is3DComponent = is3D;

          // Filtrar los archivos según 2D/3D
          const allFiles = is3D
            ? this.existingFiles!['3D']
            : this.existingFiles!['2D'];

          // Aquí hacemos la clasificación "left/right"
          const leftFiles = allFiles.filter(f =>
            f.name?.toLowerCase().match(/(left|izq|izquierda|^l)/)
          );
          const rightFiles = allFiles.filter(f =>
            f.name?.toLowerCase().match(/(right|der|derecha|^r)/)
          );

          // Pasan al componente con el formato correcto
          uploadComp.instance.setFiles([{ leftFiles, rightFiles }]);
          uploadComp.instance.isVisible = index === this.activeStepIndex;

          this.saveFilesInHistory(index, leftFiles, rightFiles);
        }
      });
    }
  }

  // Inicializa el stepper
  private initializeStepper() {
    this.steps = (this.formConfig.stepsContent ?? []).map((_, index) => ({
      label: `Step ${index + 1}`,
    }));
    this.removeAllUploadComponents();
  }

  // Inicializa el formulario
  private initializeForm() {
    const group: any = {};

    this.formConfig.stepsContent?.forEach(step => {
      if (step.formConfig) {
        step.formConfig.forEach(config => {
          config.child.forEach(fieldConfig => {
            const validators = fieldConfig.mandatory
              ? [Validators.required]
              : [];
            group[fieldConfig.apiField] = [fieldConfig.value ?? '', validators];
          });
        });
      }
    });

    this.form = this.fb.group(group);
    this.cdr.detectChanges();
  }

  // Nétodo que inicioaliza el componente de subida
  private initializeUploadComponent(stepIndex: number) {
    const { leftFiles, rightFiles } = this.loadFilesFromHistory(stepIndex);
    const componentRef = this.createUploadComponent(
      leftFiles,
      rightFiles,
      stepIndex
    );
    componentRef.instance.isVisible = true;
  }

  // Método que crea el componente de subida de archivos
  createUploadComponent(
    leftFiles: any[],
    rightFiles: any[],
    stepIndex: number
  ): ComponentRef<UploadFilesComponent> {
    if (!this.uploadContainer) {
      throw new Error('uploadContainer no está definido');
    }

    this.uploadKey++;
    const componentRef =
      this.uploadContainer.createComponent(UploadFilesComponent);

    componentRef.instance.uploadKey = this.uploadKey;
    componentRef.instance.setFiles([...leftFiles, ...rightFiles]);

    // Actualiza el  historial
    componentRef.instance.filesChange.subscribe(() => {
      const classifiedFiles = componentRef.instance.classifyFiles();
      this.saveFilesInHistory(
        stepIndex,
        classifiedFiles.leftFiles,
        classifiedFiles.rightFiles
      );
    });

    // Si el paso acepta Excel, se maneja la carga del archivo
    if (this.formConfig!.stepsContent![stepIndex].isExcelUpload) {
      componentRef.instance.isExcelUpload = true;
      componentRef.instance.excelDataLoaded.subscribe(excelData => {
        this.excelData = excelData;
      });
    } else {
      componentRef.instance.filesUploaded.subscribe(uploadedFiles => {
        console.log('Archivos subidos:', uploadedFiles);
      });
    }

    this.uploadComponents[stepIndex] = componentRef;
    return componentRef;
  }

  saveFilesInHistory(step: number, leftFiles: any[], rightFiles: any[]): void {
    this.filesHistory[step] = { leftFiles, rightFiles };
  }

  loadFilesFromHistory(step: number): { leftFiles: any[]; rightFiles: any[] } {
    return this.filesHistory[step] || { leftFiles: [], rightFiles: [] };
  }

  removeAllUploadComponents() {
    this.uploadComponents.forEach(component => component.destroy());
    this.uploadComponents = [];
  }

  // Lógica para actualizar el formulario
  updateForm(newConfig: CollectionFormConfig[]): void {
    const step = this.formConfig.stepsContent?.[this.activeStepIndex];
    if (step) {
      step.formConfig = newConfig;
      this.initializeForm();
      this.cdr.detectChanges();
    }
  }

  getFormValue(): any {
    return this.form.value;
  }

  onRadioButtonChange() {
    this.radioChange.emit(this.selectedRadio);
  }

  // Verifica si el paso actual es válido antes de avanzar
  isCurrentStepValid(): boolean {
    const step = this.formConfig.stepsContent?.[this.activeStepIndex];
    if (!step) return true; // Sin paso activo, permite avanzar

    // Valida el formulario solo si showForm es true
    if (step.showForm && step.formConfig && step.formConfig.length > 0) {
      const mandatoryFields = step.formConfig
        .flatMap(group => group.child)
        .filter(f => f.mandatory);

      for (const field of mandatoryFields) {
        const control = this.form.get(field.apiField);

        if (control && !control.value) {
          return false;
        }
      }
    }

    if (step.radioButtons && step.radioButtons.length > 0) {
      if (!this.selectedRadio) {
        return false;
      }
    }

    return true;
  }

  nextStep() {
    if (!this.isCurrentStepValid()) {
      return;
    }

    this.moveToNextStep();
  }

  prevStep() {
    if (this.activeStepIndex > 0) {
      if (this.uploadComponents[this.activeStepIndex]) {
        this.uploadComponents[this.activeStepIndex].instance.isVisible = false;
      }
      this.activeStepIndex--;

      if (this.uploadComponents[this.activeStepIndex]) {
        this.uploadComponents[this.activeStepIndex].instance.isVisible = true;
      }
    }
  }

  private moveToNextStep() {
    if (this.activeStepIndex < this.steps.length - 1) {
      if (this.uploadComponents[this.activeStepIndex]) {
        this.uploadComponents[this.activeStepIndex].instance.isVisible = false;
      }

      this.activeStepIndex++;
      this.selectedRadio = '';

      if (this.formConfig.stepsContent?.[this.activeStepIndex]?.showUpload) {
        if (!this.uploadComponents[this.activeStepIndex]) {
          this.initializeUploadComponent(this.activeStepIndex);
        } else {
          this.uploadComponents[this.activeStepIndex].instance.isVisible = true;
        }
      }
    }
  }

  executeAction(action: () => void) {
    action();
  }

  get stepsModel() {
    return (
      this.formConfig?.stepsContent?.map(step => ({
        label: step.label || 'Step',
      })) || []
    );
  }

  // Acepta el formulario y emite los datos recogidos
  accept() {
    if (!this.form) {
      console.error('Formulario no inicializado');
      return;
    }

    if (this.form.valid) {
      const formData = this.getFormValue();
      const combinedData = {
        formData,
        filesHistory: this.filesHistory,
        excelData: this.excelData,
      };
      this.acceptForm.emit(combinedData);
      console.log(combinedData);
    } else {
      console.error('El formulario no es válido');
    }
  }

  handleCustomSelection(selection: any[]) {
    this.customSelectedItems = selection;
    this.selectionChanged.emit(selection);
  }
}
