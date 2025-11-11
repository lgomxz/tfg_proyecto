import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { bucket } from '../../config/firebase.config';
import { InsertResult, MoreThan, Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { Role } from 'src/entities/role.entity';
import { MailService } from 'src/mail/mail.service';
import * as path from 'path';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    @InjectRepository(Role)
    private rolesRepository: Repository<Role>,
    private readonly mailService: MailService,
  ) {}

  // Creación de usuario
  create(user: User): Promise<InsertResult> {
    return this.usersRepository
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(user)
      .execute();
  }

  // Validación de usuario
  async validateUser(email: string, password: string): Promise<User | null> {
    // Busca un usuario por email
    const user = await this.usersRepository.findOne({ where: { email } });
    // Compara la contraseña introducida con la almacenada (hasheada)
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  // Creación de usuario pendiente
  async createPending(user: User): Promise<void> {
    user.status = 'pending'; // Establece el estado como pendiente
    await this.usersRepository.save(user);
  }

  // Alta de usuario y generación de contraseña aleatoria
  async approveUser(
    id: string,
  ): Promise<{ user: User; plainPassword: string }> {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (user) {
      const saltRounds = 10;
      const plainPassword = this.generateRandomPassword(12); // Generar contraseña aleatoria

      // Hashea la contraseña generada
      user.password = await bcrypt.hash(plainPassword, saltRounds);
      user.status = 'accepted';

      // Guarda los cambios en la base de datos
      await this.usersRepository.save(user);

      // Retorna el usuario y la contraseña en texto plano como un objeto separado
      return { user, plainPassword };
    }
    throw new Error('User not found');
  }

  // Asignación de rol a usuario
  async setRole(userId: string, roleId: string): Promise<void> {
    const user = await this.usersRepository.findOneBy({ id: userId });
    const role = await this.rolesRepository.findOneBy({ id: roleId });

    if (!user) {
      throw new Error('User not found');
    }

    if (!role) {
      throw new Error('Role not found');
    }

    user.role = role;

    await this.usersRepository.save(user);
  }

  // Obtiene el id de un usuario
  async getRoleId(email: string): Promise<string | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user || !user.role) {
      return null;
    }

    return user.role.id;
  }

  // Genera una contraseña aleatoria
  private generateRandomPassword(length: number): string {
    const characters =
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';
    let password = '';
    const bytes = randomBytes(length); // Genera bytes aleatorios

    for (let i = 0; i < length; i++) {
      const randomIndex = bytes[i] % characters.length; // Calcula un índice dentro del rango de caracteres
      password += characters[randomIndex];
    }

    return password;
  }

  // Método para generar el token de restablecimiento de contraseña
  async generateResetToken(email: string): Promise<string> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new Error('User not found');
    }

    // Genera un token aleatorio
    const token = randomBytes(32).toString('hex');

    // Establece el token y su fecha de expiración (1 hora)
    user.resetPasswordToken = token;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);

    await this.usersRepository.save(user);

    return token;
  }

  // Método para restablecer la contraseña usando el token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: MoreThan(new Date()), // Verifica que el token no haya expirado
      },
    });

    if (!user) {
      throw new Error('Invalid or expired token');
    }

    // Hashea la nueva contraseña
    const saltRounds = 10;
    user.password = await bcrypt.hash(newPassword, saltRounds);

    // Limpia el token y su expiración después de restablecer la contraseña
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;

    await this.usersRepository.save(user);
  }

  // Envñio de email para restablecimiento de contraslea
  async sendResetPasswordEmail(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { email } });

    if (!user) {
      // Si el email no existe, simplemente retorna sin hacer nada, ,así no peuden saber qué emails tienen cuentas y cuáles no
      return;
    }
    const token = await this.generateResetToken(email);
    const resetUrl = `http://local.tfg.spa/reset/${token}`; //url temporal, solo para desarrollo

    await this.mailService.sendResetPasswordMail(email, resetUrl);
  }

  // Elimina un usuario por su ID
  async deleteUser(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // Obtiene todos los usuarios
  async getAll(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.find();

    return users.map((user) => ({
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      description: user.description,
      status: user.status,
    }));
  }

  // Devuelve los usuarios pendientes
  async getPending(): Promise<User[]> {
    return this.usersRepository.findBy({ status: 'pending' });
  }

  // Devuelve los usuarios admitidos
  async getAccepted(): Promise<Partial<User>[]> {
    const users = await this.usersRepository.findBy({ status: 'accepted' });
    return users.map((user) => ({
      id: user.id,
      name: user.name,
      lastname: user.lastname,
      email: user.email,
      description: user.description,
      status: user.status,
    }));
  }

  // Deuvuelve un usuario con un id específico
  async getById(id: string): Promise<User> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['role'], // Carga la relación con Role
    });
  }

  // Devuelve la descripción de un usuario
  async getDescriptionById(id: string): Promise<string | null> {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (user) {
      return user.description;
    }
    return null;
  }

  // Devuelve el email de un usuario
  async getUserEmailById(id: string): Promise<string | null> {
    const user = await this.usersRepository.findOneBy({ id: id });
    if (user) {
      return user.email;
    }
    return null;
  }

  // Elimina un usuario
  async delete(id: string): Promise<void> {
    await this.usersRepository.delete(id);
  }

  // Actualiza un usuario
  async update(userId: string, userData: Partial<User>): Promise<User> {
    const user = await this.usersRepository.findOneBy({ id: userId });

    if (!user) {
      throw new Error('User not found');
    }

    if (userData.password) {
      const saltRounds = 10;
      userData.password = await bcrypt.hash(userData.password, saltRounds);
    }

    // Actualiza los campos del usuario
    Object.assign(user, userData);

    await this.usersRepository.save(user);
    return user;
  }

  // Obtiene usuario por email (sin contraseñas ni tokens)
  async getUserByEmail(email: string): Promise<Partial<User> | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
      relations: ['role'],
    });

    if (!user) return null;

    const {
      password,
      resetPasswordExpires,
      resetPasswordToken,
      status,
      update_date,
      ...safeUser
    } = user;

    return safeUser;
  }

  // Obtiene el url de la foto de perfil de usuario
  async getPhotoUrlById(id: string): Promise<string | null> {
    const user = await this.usersRepository.findOneBy({ id });
    return user?.photoUrl || null;
  }

  // Subida de foto de perfil a firebase
  async uploadPhotoToBucket(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const uniqueName = randomBytes(16).toString('hex') + fileExtension;
    const destination = `profile/${userId}/${uniqueName}`;

    const blob = bucket.file(destination);
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: file.mimetype,
      },
    });

    return new Promise<string>((resolve, reject) => {
      blobStream.on('error', (err) => reject(err));

      blobStream.on('finish', async () => {
        try {
          await blob.makePublic();
          const publicUrl = `https://storage.googleapis.com/${bucket.name}/${destination}`;

          // Actualiza el usuario con la nueva foto
          const user = await this.usersRepository.findOneBy({ id: userId });
          if (!user) {
            throw new Error('User not found');
          }
          user.photoUrl = publicUrl;
          await this.usersRepository.save(user);

          resolve(publicUrl);
        } catch (error) {
          reject(error);
        }
      });

      blobStream.end(file.buffer);
    });
  }
}
