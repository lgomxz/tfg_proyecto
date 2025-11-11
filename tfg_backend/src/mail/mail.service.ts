import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { User } from 'src/entities/user.entity';

@Injectable()
export class MailService {
  // Transportador de correo para enviar emails
  private transporter;

  constructor() {
    // Configuración de nodemailer junto con Gmail y credenciales del admin
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_ADMIN,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  // Se notifica al admin que tiene una solicitud de registro
  async sendAdminApprovalMail(user: User): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_ADMIN,
      to: process.env.EMAIL_ADMIN,
      subject: 'Nuevo registro pendiente de aprobación',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h3>Nuevo Registro Pendiente de Aprobación</h3>
          <p><strong>Nombre:</strong> ${user.name}</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p>Por favor, revise y apruebe o rechace este registro.</p>
        </div>
      `,
    });
  }

  // Se envían las credenciales al usuario cuando se aprueba el registro
  async sendUserCredentialsMail(
    user: User,
    plainPassword: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_ADMIN,
      to: user.email,
      subject: 'Registro aprobado',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h3>¡Tu Registro ha Sido Aprobado!</h3>
          <p>Hola ${user.name},</p>
          <p>Tu registro ha sido aprobado. Aquí están tus credenciales:</p>
          <p><strong>Email:</strong> ${user.email}</p>
          <p><strong>Contraseña:</strong> ${plainPassword}</p>
          <p>Por favor, cambia tu contraseña al iniciar sesión por primera vez.</p>
        </div>
      `,
    });
  }

  // Se envía un email genérico al administrador
  async sendEmail(from: string, subject: string, body: string): Promise<void> {
    await this.transporter.sendMail({
      from: from,
      to: process.env.EMAIL_ADMIN,
      subject,
      html: body,
    });
  }

  // Envía un correo con una contraseña temporal
  async sendPasswordResetMail(user: User, tempPassword: string): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.EMAIL_ADMIN,
      to: user.email,
      subject: 'Restablecimiento de contraseña',
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h3>Solicitud de Restablecimiento de Contraseña</h3>
          <p>Hola ${user.name},</p>
          <p>Recibimos una solicitud para restablecer tu contraseña. Aquí tienes una contraseña temporal:</p>
          <p><strong>Contraseña temporal:</strong> ${tempPassword}</p>
          <p>Por favor, usa esta contraseña para iniciar sesión y cambia tu contraseña inmediatamente.</p>
        </div>
      `,
    });
  }
  // Envía un email para restablecer la contraseña con un enlace
  async sendResetPasswordMail(to: string, resetUrl: string): Promise<void> {
    const mailOptions = {
      from: '"UGR Support" <tfg.project.2024@gmail.com>',
      to: to,
      subject: 'Password Reset Request',
      text: `You requested a password reset. Please click on the following link to reset your password: ${resetUrl}`,
      html: `<p>You requested a password reset. Please click on the following link to reset your password:</p><a href="${resetUrl}">Reset Password</a>`,
    };

    await this.transporter.sendMail(mailOptions);
  }
}
