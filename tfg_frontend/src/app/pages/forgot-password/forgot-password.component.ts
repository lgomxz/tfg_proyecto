import { Component, OnInit } from '@angular/core';
import { NgParticlesService, NgxParticlesModule } from '@tsparticles/angular';
import { MoveDirection, OutMode } from '@tsparticles/engine';
import { loadSlim } from '@tsparticles/slim';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { InputTextModule } from 'primeng/inputtext';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    NgxParticlesModule,
    FormsModule,
    MatButtonModule,
    InputTextModule,
    CommonModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
  id = 'tsparticles';
  email: string = '';
  forgotPasswdSuccess: boolean = false;
  submitted: boolean = false; // Variable para manejar el estado de envío
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

  constructor(
    private readonly ngParticlesService: NgParticlesService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.ngParticlesService.init(async engine => {
      await loadSlim(engine);
    });
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.email) {
      this.authService.forgotPassword(this.email).subscribe({
        next: () => {
          this.forgotPasswdSuccess = true; 
          this.errorMessage = '';
          this.email = '';
          this.submitted = false;
        },
        error: () => {
          this.errorMessage = 'Error sending email. Please try again.';
          this.submitted = false;
        }
      });
    }
  }
}
