import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { User } from 'src/entities/user.entity';
import { UserService } from './user.service';
import { MailService } from 'src/mail/mail.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(
    private userService: UserService,
    private mailService: MailService,
  ) {}

  @Post('create')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() user: User): Promise<{ code: number }> {
    try {
      await this.userService.createPending(user);
      await this.mailService.sendAdminApprovalMail(user);

      return {
        code: HttpStatus.CREATED,
      };
    } catch (error) {
      return {
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      };
    }
  }

  @Post('send-email')
  @HttpCode(HttpStatus.OK)
  async sendEmail(
    @Body() emailData: { from: string; subject: string; body: string },
  ): Promise<{ code: number }> {
    try {
      await this.mailService.sendEmail(
        emailData.from,
        emailData.subject,
        emailData.body,
      );
      return { code: HttpStatus.OK };
    } catch (error) {
      throw new HttpException(
        'Error sending mail',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Put(':id/role')
  async setUserRole(
    @Param('id') userId: string,
    @Body('roleId') roleId: string,
  ): Promise<void> {
    try {
      await this.userService.setRole(userId, roleId);
    } catch (error) {
      throw new NotFoundException('Error setting user role');
    }
  }

  @Get('role-id')
  async getRoleId(@Query('email') email: string): Promise<{ roleId: string }> {
    const roleId = await this.userService.getRoleId(email);

    if (!roleId) {
      throw new NotFoundException('User or role not found');
    }

    return { roleId };
  }

  @Put('approve/:id')
  async approveUser(@Param('id') id: string): Promise<void> {
    try {
      const { user, plainPassword } = await this.userService.approveUser(id);

      await this.mailService.sendUserCredentialsMail(user, plainPassword);
    } catch (error) {
      throw new NotFoundException('Error approving user');
    }
  }

  @Delete('reject/:id')
  async rejectUser(@Param('id') id: string): Promise<void> {
    await this.userService.deleteUser(id);
  }

  @Get('getAll')
  async getAll(): Promise<Partial<User>[]> {
    return await this.userService.getAll();
  }

  @Get('getPending')
  async getPending(): Promise<User[]> {
    return await this.userService.getPending();
  }

  @Get('getAccepted')
  async getAccepted(): Promise<Partial<User>[]> {
    return await this.userService.getAccepted();
  }

  @Get('getById/:id')
  async getById(@Param('id') id: string): Promise<User> {
    return await this.userService.getById(id);
  }

  @Get('getDescriptionById/:id')
  async getDescriptionById(
    @Param('id') id: string,
  ): Promise<{ description: string }> {
    return { description: await this.userService.getDescriptionById(id) };
  }

  @Get('getEmailById/:id')
  async getEmailById(@Param('id') id: string): Promise<{ email: string }> {
    return { email: await this.userService.getUserEmailById(id) };
  }

  @Put(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() userData: Partial<User>,
  ): Promise<User> {
    return this.userService.update(id, userData);
  }

  @Get('getByEmail/:email')
  async getUserByEmail(@Param('email') email: string): Promise<Partial<User>> {
    const user = await this.userService.getUserByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get(':id/photo')
  async getUserPhoto(@Param('id') id: string) {
    const photoUrl = await this.userService.getPhotoUrlById(id);
    return { photoUrl };
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadUserPhoto(
    @Param('id') userId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const photoUrl = await this.userService.uploadPhotoToBucket(userId, file);
    return { message: 'Photo uploaded succesfully', photoUrl };
  }
}
