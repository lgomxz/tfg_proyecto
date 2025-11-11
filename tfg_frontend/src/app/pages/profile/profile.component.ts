import {
  ChangeDetectorRef,
  Component,
  OnInit,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { MatButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { FormComponent } from '../../components/form/form.component';
import {
  FormInputWidth,
  FormInputType,
  FormConfig,
  CollectionFormConfig,
} from '../../components/form/form';
import { UserApiService } from '../../services/user-api.service';
import { AuthService } from '../../services/auth.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from '../../models/user';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  ImageCropperComponent,
  ImageCroppedEvent,
  LoadedImage,
} from 'ngx-image-cropper';
import { DomSanitizer } from '@angular/platform-browser';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';

@UntilDestroy()
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    MatButton,
    MatIconModule,
    InputTextModule,
    ReactiveFormsModule,
    InputTextareaModule,
    ButtonModule,
    CommonModule,
    DropdownModule,
    CalendarModule,
    FormComponent,
    MatDialogModule,
    ImageCropperComponent,
    TranslateModule,
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})
export class ProfileComponent implements OnInit {
  form!: FormGroup;
  passwordForm!: FormGroup;
  user!: User;

  imageUrl: string | null = null;
  userRole: string = '';
  userRoleKey: string = '';
  imageChangedEvent: Event | null = null;
  croppedImage: Blob | null = null;

  @ViewChild('imageCropperDialog') imageCropperDialog!: TemplateRef<any>;

  isEditCardOpen = false; // Controla si la card de edición de la foto está abierta
  emailUser: string | undefined;
  errorMessage: string | null = null;
  showSuccessMessageUser: boolean = false;
  showPasswordSuccessMessage: boolean = false;
  formConfig: CollectionFormConfig[] = [];
  passwdFormConfig: CollectionFormConfig[] = [];

  constructor(
    private authApiService: AuthService,
    private userApiService: UserApiService,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private sanitizer: DomSanitizer,
    private translate: TranslateService
  ) {}

  private loadTranslations() {
    forkJoin({
      formTranslations: this.translate.get('FORM').toPromise(),
      passwordTranslations: this.translate.get('PASSWORD').toPromise(),
    }).subscribe(translations => {
      // Configuración del formulario de datos personales
      this.formConfig = [
        {
          groupName: translations.formTranslations.PERSONAL_DATA,
          child: [
            {
              id: 'name',
              mandatory: true,
              label: translations.formTranslations.NAME,
              apiField: 'name',
              type: FormInputType.TEXT,
              width: FormInputWidth.L,
              showAtlasButton: false,
            },
            {
              id: 'lastname',
              mandatory: true,
              label: translations.formTranslations.LASTNAME,
              apiField: 'lastname',
              type: FormInputType.TEXT,
              width: FormInputWidth.L,
            },
          ],
        },
        {
          groupName: '',
          child: [
            {
              id: 'email',
              mandatory: true,
              label: translations.formTranslations.EMAIL,
              apiField: 'email',
              type: FormInputType.EMAIL,
              width: FormInputWidth.XL,
            },
          ],
        },
        {
          groupName: '',
          child: [
            {
              id: 'summary',
              mandatory: false,
              label: translations.formTranslations.SUMMARY,
              apiField: 'summary',
              type: FormInputType.TEXTAREA,
              width: FormInputWidth.FULL,
            },
          ],
        },
      ];

      this.passwdFormConfig = [
        {
          groupName: translations.passwordTranslations.CONFIGURATION,
          child: [
            {
              id: 'password',
              mandatory: true,
              label: translations.passwordTranslations.PASSWORD,
              apiField: 'password',
              readOnly: false,
              type: FormInputType.PASSWORD,
              width: FormInputWidth.L,
              showPasswordStrengthMeter: true,
            },
            {
              id: 'repeatPassword',
              mandatory: true,
              label: translations.passwordTranslations.REPEAT_PASSWORD,
              apiField: 'repeatPassword',
              type: FormInputType.PASSWORD,
              width: FormInputWidth.L,
              showPasswordStrengthMeter: false,
            },
          ],
        },
      ];

      this.setupFormControls(); // Configura los controles del formulario después de cargar las traducciones
    });
  }

  private setupFormControls() {
    const formControls: { [key: string]: FormControl } = {};
    const passwordControls: { [key: string]: FormControl } = {};

    // Inicializa los controles del formulario para personal data
    this.formConfig.forEach(el => {
      el.child.forEach(
        subEl => (formControls[subEl.apiField] = new FormControl())
      );
    });

    // Inicializa los controles del formulario para configuración de contraseñas
    this.passwdFormConfig.forEach(el => {
      el.child.forEach(
        subEl => (passwordControls[subEl.apiField] = new FormControl())
      );
    });

    this.form = new FormGroup(formControls);
    this.passwordForm = new FormGroup(passwordControls);
  }

  async ngOnInit() {
    const formControls: { [key: string]: FormControl } = {};
    const passwordControls: { [key: string]: FormControl } = {};

    this.loadTranslations();

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe(() => {
      this.loadTranslations();
    });

    this.authApiService
      .getUserEmail()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: async email => {
          this.emailUser = email || 'default@example.com';

          try {
            const userData = await this.userApiService
              .getUserByEmail(this.emailUser)
              .toPromise();

            if (userData?.id) {
              this.userApiService
                .getUserPhotoUrlById(userData?.id)
                .subscribe(response => {
                  const photoUrl = response.photoUrl;
                  if (photoUrl === null) {
                    this.imageUrl = '../../assets/img/default.jpg';
                  } else {
                    this.imageUrl = photoUrl;
                  }
                });
            }

            this.user = {
              id: userData?.id,
              name: userData!.name,
              lastname: userData!.lastname,
              email: userData!.email,
              description: userData!.description,
            };

            this.userRoleKey = (userData!.role!.name || '').toUpperCase(); // ej. "NOVICE"
            this.updateTranslatedRole();

            this.form.patchValue({
              name: this.user.name,
              lastname: this.user.lastname,
              email: this.user.email,
              summary: this.user.description,
            });
          } catch (error) {
            console.error('Error al obtener el usuario por email:', error);
          }
        },
        error: () => {
          console.error('Error al obtener el email');
        },
      });

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe(() => {
      this.loadTranslations();
      this.updateTranslatedRole();
    });

    // Inicializa los controles del formulario
    this.formConfig.forEach(el => {
      el.child.forEach(
        subEl => (formControls[subEl.apiField] = new FormControl())
      );
    });

    this.passwdFormConfig.forEach(el => {
      el.child.forEach(
        subEl => (passwordControls[subEl.apiField] = new FormControl())
      );
    });

    this.form = new FormGroup(formControls);
    this.passwordForm = new FormGroup(passwordControls);
  }

  private updateTranslatedRole(): void {
    if (this.userRoleKey) {
      this.userRole = this.translate.instant('ROLES.' + this.userRoleKey);
    }
  }

  getInputWidth(width?: string) {
    return width ? { [width]: true } : null;
  }

  onImageLoad(event: Event) {
    const target = event.target as HTMLImageElement;
    target.classList.add('loaded');
  }

  getValidators(field: FormConfig) {
    const validators = [];
    if (field.mandatory) {
      validators.push(Validators.required);
    }
    if (field.type === FormInputType.EMAIL) {
      validators.push(Validators.email);
    }
    return validators;
  }

  modifyUser() {
    const updatedUser: User = {
      name: this.form.value.name,
      lastname: this.form.value.lastname,
      email: this.form.value.email,
      description: this.form.value.summary,
    };

    this.userApiService.updateUser(this.user.id!, updatedUser).subscribe({
      next: () => {
        this.showSuccessMessageUser = true;
        setTimeout(() => {
          const successMessageElement = document.querySelector(
            '.success-message-user'
          );
          if (successMessageElement) {
            successMessageElement.classList.add('fade-out');
          }
        }, 1000);

        setTimeout(() => {
          this.showSuccessMessageUser = false;
        }, 2500);
      },
      error: error => {
        console.error('Error updating user:', error);
      },
    });
  }

  changePassword() {
    const password = this.passwordForm.get('password')?.value;
    const repeatPassword = this.passwordForm.get('repeatPassword')?.value;

    // Verifica si los campos están vacíos
    if (!password || !repeatPassword) {
      this.errorMessage = 'Los campos de contraseña no pueden estar vacíos';
      return;
    }

    // Verifica si las contraseñas coinciden
    if (password !== repeatPassword) {
      this.errorMessage = 'Las contraseñas no coinciden';
      return;
    }

    // Si las contraseñas coinciden y no están vacías, limpia el mensaje de error
    this.errorMessage = null;
    const updatedPassword: User = {
      password: password,
    };

    this.userApiService.updateUser(this.user.id!, updatedPassword).subscribe({
      next: () => {
        this.showPasswordSuccessMessage = true;
        setTimeout(() => {
          const successMessageElement = document.querySelector(
            '.success-message-pwd'
          );
          if (successMessageElement) {
            successMessageElement.classList.add('fade-out');
          }
        }, 1000);

        setTimeout(() => {
          this.showPasswordSuccessMessage = false;
        }, 2500);
      },
      error: error => {
        console.error('Error updating user:', error);
      },
    });
  }

  openEditCard() {
    this.isEditCardOpen = true; // Abre la tarjeta de edición
  }

  closeEditCard() {
    this.imageUrl =
      'https://primefaces.org/cdn/primeng/images/demo/avatar/asiyajavayant.png'; //Provisional
    this.isEditCardOpen = false; // Cierra la tarjeta de edición
  }

  cancel(): void {
    this.croppedImage = null; // Limpia la imagen recortada si es necesario
    this.dialog.closeAll();
  }

  onFileChange(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.imageChangedEvent = event;
        this.dialog.open(this.imageCropperDialog, {
          width: '600px',
          disableClose: true,
        });
      };
      reader.readAsDataURL(file);
    }
  }

  base64ToBlob(base64: string): Blob {
    const byteString = atob(base64.split(',')[1]);
    const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  imageCropped(event: ImageCroppedEvent): void {
    if (event.blob) {
      this.croppedImage = event.blob;
    } else if (event.base64) {
      this.croppedImage = this.base64ToBlob(event.base64);
    } else {
      console.error('No se pudo obtener la imagen recortada.');
    }
  }

  savePhoto(): void {
    if (this.croppedImage && this.user.id) {
      const file = new File([this.croppedImage], 'profile.png', {
        type: this.croppedImage.type || 'image/png',
      });

      this.userApiService.uploadUserPhoto(this.user.id, file).subscribe({
        next: () => {
          this.closeEditCard();
        },
        error: err => {
          console.error('Upload failed', err);
        },
      });
      this.dialog.closeAll();
      this.isEditCardOpen = false;
    }
  }

  imageLoaded(image: LoadedImage) {
    console.log('Image loaded:', image);
  }
}
