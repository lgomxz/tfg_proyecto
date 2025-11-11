import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ToastService } from '../../components/toast/toast.service';
import { MessageService } from 'primeng/api';
import { ToastType } from '../../components/toast/toast';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { AuthService } from '../../services/auth.service';
import { UserApiService } from '../../services/user-api.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';

@UntilDestroy()
@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    AccordionModule,
    InputTextModule,
    InputTextareaModule,
    MatButtonModule,
    TranslateModule,
  ],
  providers: [MessageService],
  templateUrl: './support.component.html',
  styleUrl: './support.component.scss',
})
export class SupportComponent implements OnInit {
  constructor(
    private toastService: ToastService,
    private authApiService: AuthService,
    private userApiService: UserApiService,
    private translate: TranslateService
  ) {}

  emailHelp: string | undefined;
  subjectHelp: string | undefined;
  textAreaHelp: string | undefined;

  ngOnInit(): void {
    // Subscribirse al método que obtiene el email
    this.authApiService
      .getUserEmail()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: email => {
          this.emailHelp = email || 'default@example.com';
        },
        error: () => {
          console.error('Error al obtener el email');
        },
      });
  }

  sendEmail(): void {
    const emailData = {
      from: this.emailHelp || 'default@example.com',
      subject: this.subjectHelp || 'Asunto por defecto',
      body: this.buildEmailBody(), // Llama a la función que construye el cuerpo del correo
    };

    this.userApiService
      .sendEmail(emailData)
      .pipe(untilDestroyed(this))
      .subscribe({
        next: () => {
          this.translate.get('TOAST.SUCCESS.EMAIL_SENT').subscribe(msg => {
            this.toastService.show({
              severity: ToastType.SUCCESS,
              summary: msg.SUMMARY,
              detail: msg.DETAIL,
            });
          });
        },
        error: () => {
          this.translate.get('TOAST.ERROR.EMAIL_SEND_ERROR').subscribe(msg => {
            this.toastService.show({
              severity: ToastType.ERROR,
              summary: msg.SUMMARY,
              detail: msg.DETAIL,
            });
          });
        },
      });
  }

  private buildEmailBody(): string {
    return `
      <div style="font-family: Arial, sans-serif; line-height: 1.5;">
        <h3>Formulario de Soporte</h3>
        <p><strong>Correo del Remitente:</strong> ${this.emailHelp || 'Sin Correo'}</p>
        <p><strong>Asunto:</strong> ${this.subjectHelp || 'Sin Asunto'}</p>
        <p><strong>Descripción:</strong></p>
        <p>${this.textAreaHelp || 'Sin descripción'}</p>
      </div>
    `;
  }
}
