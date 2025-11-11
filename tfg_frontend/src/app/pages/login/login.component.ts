import { Component, OnInit } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MoveDirection, OutMode } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { NgParticlesService, NgxParticlesModule } from '@tsparticles/angular';
import { CommonModule } from '@angular/common';
import { CheckboxModule } from 'primeng/checkbox';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { InputTextModule } from 'primeng/inputtext';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    NgxParticlesModule,
    MatInputModule,
    MatButtonModule,
    CheckboxModule,
    InputTextModule,
    PasswordModule,
    RouterModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
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

  loginFailed = false;
  formSubmitted: boolean = false;

  form = new FormGroup({
    email: new FormControl(),
    password: new FormControl(),
    rememberMe: new FormControl(false),
  });

  constructor(
    private readonly ngParticlesService: NgParticlesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.ngParticlesService.init(async engine => {
      await loadSlim(engine);
    });
  }

  login(): void {
    if (this.form.valid) {
      const credentials = {
        email: this.form.value.email,
        password: this.form.value.password,
        rememberMe: this.form.value.rememberMe ?? false,
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          this.router.navigate(['']);
        },
        error: () => {
          this.loginFailed = true;
        },
      });
    } else {
      console.error('Formulario inválido');
    }
  }

  // Método para detectar tecla "Enter" y ejecutar el login
  onKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.login();
    }
  }
}
