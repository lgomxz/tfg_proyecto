import { Component, OnInit } from '@angular/core';
import { NgParticlesService, NgxParticlesModule } from '@tsparticles/angular';
import { MoveDirection, OutMode } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { FormControl, FormGroup, FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { FormComponent } from '../../components/form/form.component';
import { CollectionFormConfig, FormInputType, FormInputWidth } from '../../components/form/form';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { ValidationService } from '../../components/form/validation.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    NgxParticlesModule,
    FormsModule,
    MatButtonModule,
    InputTextModule,
    CommonModule,
    FormComponent
  ],
  templateUrl: './reset-passwd.component.html',
  styleUrls: ['./reset-passwd.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  id = 'tsparticles';
  token: string = '';
  resetPasswdSuccess: boolean = false;
  submitted: boolean = false;
  errorMessage: string = '';
  
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
      child: [
        {
          id: 'passwd',
          mandatory: true,
          label: 'New Password',
          apiField: 'password',
          type: FormInputType.PASSWORD,
          width: FormInputWidth.FULL,
          showAtlasButton: false,
          showPasswordStrengthMeter: true,
        },
        {
          id: 'passwdcheck',
          mandatory: true,
          label: 'Repeat Password',
          apiField: 'confirmPassword',
          type: FormInputType.PASSWORD,
          width: FormInputWidth.FULL,
          showAtlasButton: false,
          showPasswordStrengthMeter: false,
        },
        
      ]
    },
  ];
  
  constructor(
    private readonly ngParticlesService: NgParticlesService,
    private readonly authService: AuthService,
    private route: ActivatedRoute,
    private validationService: ValidationService
  ) {}

  ngOnInit(): void {
    // Inicializa las partículas
    this.ngParticlesService.init(async engine => {
      await loadSlim(engine);
    });

    const formControls: { [key: string]: FormControl } = {};
    this.formConfig.forEach(el => {
      el.child.forEach(subEl => {
        formControls[subEl.apiField] = new FormControl('', this.validationService.getValidators(subEl));
      });
    });

    this.form = new FormGroup(formControls);
  
    // Obtiene el token de los parámetros de la ruta
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.form.valid && this.form.value.password === this.form.value.confirmPassword) {
      this.authService.resetPassword(this.token, this.form.value.password).subscribe({
        next: () => {
          this.resetPasswdSuccess = true;
          this.errorMessage = '';
        },
        error: () => {
          this.errorMessage = 'Error resetting password. Please try again.';
          this.submitted = false;
        }
      });
    } else {
      this.errorMessage = 'Passwords do not match';
      this.submitted = false;
    }
  }
} 