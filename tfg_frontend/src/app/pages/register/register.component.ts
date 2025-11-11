import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import {
  FormGroup,
  FormControl,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { NgParticlesService, NgxParticlesModule } from '@tsparticles/angular';
import { MoveDirection, OutMode } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  CollectionFormConfig,
  FormInputType,
  FormInputWidth,
} from '../../components/form/form';
import { FormComponent } from '../../components/form/form.component';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterModule } from '@angular/router';
import { UserApiService } from '../../services/user-api.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { ToastService } from '../../components/toast/toast.service';
import { ToastType } from '../../components/toast/toast';
import { ValidationService } from '../../components/form/validation.service';
import { CheckboxModule } from 'primeng/checkbox';
import { TranslateService } from '@ngx-translate/core';

@UntilDestroy()
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    NgxParticlesModule,
    FormComponent,
    ReactiveFormsModule,
    MatButtonModule,
    CommonModule,
    RouterModule,
    CheckboxModule,
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent implements OnInit {
  id = 'tsparticles';

  particlesOptions = {
    background: {
      color: {
        value: '#ffffff',
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onClick: {
          enable: true,
        },
        onHover: {
          enable: true,
        },
      },
      modes: {
        push: {
          quantity: 4,
        },
        repulse: {
          distance: 200,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: '#00B2A9',
      },
      links: {
        color: '#000000',
        distance: 150,
        enable: true,
        opacity: 0.5,
        width: 1,
      },
      move: {
        direction: MoveDirection.none,
        enable: true,
        outModes: {
          default: OutMode.bounce,
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
          area: 800,
        },
        value: 120,
      },
      opacity: {
        value: 0.8,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

  formSubmitted: boolean = false;

  form!: FormGroup;

  formConfig: CollectionFormConfig[] = [
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
          showAtlasButton: false,
        },
        {
          id: 'lastname',
          mandatory: true,
          label: 'Last Name',
          apiField: 'lastname',
          type: FormInputType.TEXT,
          width: FormInputWidth.L,
          showAtlasButton: false,
        },
        {
          id: 'email',
          mandatory: true,
          label: 'Email',
          apiField: 'email',
          type: FormInputType.EMAIL,
          width: FormInputWidth.L,
          showAtlasButton: false,
        },
      ],
    },
    {
      groupName: 'Professional Information',
      child: [
        {
          id: 'description',
          mandatory: true,
          label: 'Professional Resume',
          apiField: 'description',
          type: FormInputType.TEXTAREA,
          width: FormInputWidth.XL,
          showAtlasButton: false,
        },
      ],
    },
  ];

  constructor(
    private readonly ngParticlesService: NgParticlesService,
    @Inject(PLATFORM_ID) private platformId: object,
    private userApi: UserApiService,
    private toastService: ToastService,
    private validationService: ValidationService,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.ngParticlesService.init(async engine => {
        await loadSlim(engine);
      });
    }

    const formControls: { [key: string]: FormControl } = {};
    this.formConfig.forEach(el => {
      el.child.forEach(subEl => {
        formControls[subEl.apiField] = new FormControl(
          '',
          this.validationService.getValidators(subEl)
        );
      });
    });

    formControls['privacyPolicy'] = new FormControl(false, {
      validators: Validators.requiredTrue,
    });

    this.form = new FormGroup(formControls);
  }

  showToastSuccess() {
    this.translate.get('TOAST.SUCCESS.REGISTRATION_SUCCESS').subscribe(msg => {
      this.toastService.show({
        severity: ToastType.SUCCESS,
        summary: msg.SUMMARY,
        detail: msg.DETAIL,
      });
    });
  }

  showToastError() {
    this.translate.get('TOAST.ERROR.GENERAL').subscribe(msg => {
      this.toastService.show({
        severity: ToastType.ERROR,
        summary: msg.SUMMARY,
        detail: msg.DETAIL,
      });
    });
  }

  signUp(): void {
    this.formSubmitted = true;

    const privacyPolicyControl = this.form.get('privacyPolicy');
    const errorMessage = document.querySelector('.error-message');

    if (privacyPolicyControl?.invalid) {
      errorMessage?.classList.add('show');
      return;
    } else {
      errorMessage?.classList.remove('show');
    }

    if (this.form.valid) {
      const personalData = this.form.value;
      this.userApi
        .registerUser(personalData)
        .pipe(untilDestroyed(this))
        .subscribe(response => {
          if (response.status === 201) {
            this.showToastSuccess();
            this.router.navigate(['/login']);
          } else {
            this.showToastError();
          }
        });
    } else {
      this.showToastError();
    }
  }
}
