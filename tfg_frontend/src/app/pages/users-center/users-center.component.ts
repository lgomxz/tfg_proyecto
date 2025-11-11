import { Component, ViewChild, OnInit, ChangeDetectorRef } from '@angular/core';
import { TabViewModule } from 'primeng/tabview';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TableComponent } from '../../components/table/table.component';
import { User } from '../../models/user';
import { ColumnsConfig } from '../../components/table/table';
import { UserApiService } from '../../services/user-api.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { NewDialogComponent } from '../../components/new-dialog/new-dialog.component';
import { DialogConfig } from '../../components/new-dialog/dialog';
import {
  CollectionFormConfig,
  FormInputType,
  FormInputWidth,
} from '../../components/form/form';
import { RolesApiService } from '../../services/roles-api.service';
import { Role } from '../../models/role';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@UntilDestroy()
@Component({
  selector: 'app-users-center',
  standalone: true,
  imports: [
    TabViewModule,
    MatPaginatorModule,
    TableComponent,
    NewDialogComponent,
    TranslateModule,
  ],
  templateUrl: './users-center.component.html',
  styleUrls: ['./users-center.component.scss'],
})
export class UsersCenterComponent implements OnInit {
  @ViewChild('newDialogComponent') newDialogComponent!: NewDialogComponent;
  @ViewChild('editUserDialogComponent')
  editUserDialogComponent!: NewDialogComponent;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  selectedRow?: User;
  myUsersData: User[] = [];
  myPendingUsersData: User[] = [];

  showEditUser: boolean = false;
  showDeleteUser: boolean = false;

  newUserConfig: CollectionFormConfig[] = [
    {
      groupName: 'Personal data',
      child: [
        {
          id: 'description',
          mandatory: true,
          label: 'Profesional resume',
          apiField: 'description',
          type: FormInputType.TEXTAREA,
          width: FormInputWidth.FULL,
          values: [],
          showAtlasButton: false,
          readOnly: true,
        },
      ],
    },
    {
      groupName: 'Role information',
      child: [
        {
          id: 'role',
          mandatory: true,
          label: 'Role',
          apiField: 'role',
          type: FormInputType.SELECT,
          width: FormInputWidth.FULL,
          values: [
            /*{ code: 'nov', description: 'Novice' },
            { code: 'int', description: 'Intermediate' },
            { code: 'exp', description: 'Expert'}*/
          ],
          showAtlasButton: false,
        },
      ],
    },
  ];

  showAcceptUserDialog = false;
  acceptUserDialogConfig: DialogConfig = {
    header: 'Accept User',
    stepsContent: [
      {
        showForm: true,
        text: 'What role do you want to assign?',
        formConfig: this.newUserConfig,
      },
    ],
    buttons: [
      {
        label: 'Cancel',
        action: () => this.closeDialog(),
        severity: 'secondary',
      },
      { label: 'Accept', action: () => this.accept(), severity: 'primary' },
    ],
    showStepper: false,
  };

  showDeclineUserDialog = false;
  declineUserDialogConfig: DialogConfig = {
    header: 'Decline User',
    stepsContent: [
      {
        showForm: true,
        text: 'Are you sure you want to decline this user?',
        formConfig: [],
      },
    ],
    buttons: [
      {
        label: 'Cancel',
        action: () => this.closeDialog(),
        severity: 'secondary',
      },
      { label: 'Decline', action: () => this.delete(), severity: 'primary' },
    ],
    showStepper: false,
  };

  editUserForm: CollectionFormConfig[] = [
    {
      groupName: 'Edit information',
      child: [
        {
          id: 'name',
          apiField: 'name',
          label: 'Name',
          type: FormInputType.TEXT,
          mandatory: true,
          width: FormInputWidth.FULL,
          value: '',
        },
        {
          id: 'lastname',
          apiField: 'lastname',
          label: 'Last Name',
          type: FormInputType.TEXT,
          mandatory: true,
          width: FormInputWidth.FULL,
          value: '',
        },
        {
          id: 'email',
          apiField: 'email',
          label: 'Email',
          type: FormInputType.TEXT,
          mandatory: true,
          width: FormInputWidth.FULL,
          value: '',
        },
        {
          id: 'description',
          label: 'Profesional resume',
          apiField: 'description',
          type: FormInputType.TEXTAREA,
          width: FormInputWidth.FULL,
          value: '',
          showAtlasButton: false,
          mandatory: true,
        },
        {
          id: 'roleId',
          label: 'Role',
          apiField: 'roleId',
          type: FormInputType.SELECT,
          width: FormInputWidth.FULL,
          values: [],
          showAtlasButton: false,
          mandatory: true,
        },
      ],
    },
  ];

  // Configuración de diálogos
  editUserDialog: DialogConfig = {
    header: 'Edit user',
    stepsContent: [
      { showForm: true, text: 'Prueba', formConfig: this.editUserForm },
    ],
    buttons: [
      {
        label: 'Cancel',
        action: () => this.closeDialog(),
        severity: 'secondary',
      },
      { label: 'Save', action: () => this.edit(), severity: 'primary' },
    ],
    showStepper: false,
  };

  deleteUserDialog: DialogConfig = {
    header: 'Delete user',
    stepsContent: [
      { text: 'Are you sure you want to delete this user?', formConfig: [] },
    ],
    buttons: [
      {
        label: 'Cancel',
        action: () => this.closeDialog(),
        severity: 'secondary',
      },
      { label: 'Delete', action: () => this.delete(), severity: 'primary' },
    ],
    showStepper: false,
  };

  isUserIcons: boolean = true;
  usersColumns: ColumnsConfig[] = [];

  private userIdToUse?: number;

  constructor(
    private userApiService: UserApiService,
    private cdr: ChangeDetectorRef,
    private rolesApiService: RolesApiService,
    private translate: TranslateService
  ) {}

  private loadTranslations() {
    this.translate.get('USERS_COLUMNS').subscribe(translations => {
      this.usersColumns = Object.keys(translations).map(key => ({
        title: translations[key],
        apiField: key.toLowerCase(),
      }));
    });
  }

  private updateColumnsTranslations() {
    this.translate.get('USERS_COLUMNS').subscribe(translations => {
      this.usersColumns = Object.keys(translations).map(key => ({
        title: translations[key],
        apiField: key.toLowerCase(),
      }));
    });
  }

  private updateDialogsTranslations() {
    this.translate.get('DIALOGS').subscribe((translations: any) => {
      const dialogs = [
        {
          config: this.acceptUserDialogConfig,
          header: 'ACCEPT_USER_HEADER',
          text: 'ACCEPT_USER_TEXT',
          button1: 'CANCEL_BUTTON',
          button2: 'ACCEPT_BUTTON',
        },
        {
          config: this.declineUserDialogConfig,
          header: 'DECLINE_USER_HEADER',
          text: 'DECLINE_USER_TEXT',
          button1: 'CANCEL_BUTTON',
          button2: 'DECLINE_BUTTON',
        },
        {
          config: this.editUserDialog,
          header: 'EDIT_USER_HEADER',
          text: 'EDIT_USER_HEADER',
          button1: 'CANCEL_BUTTON',
          button2: 'SAVE_BUTTON',
        },
        {
          config: this.deleteUserDialog,
          header: 'DELETE_USER_HEADER',
          text: 'DELETE_USER_TEXT',
          button1: 'CANCEL_BUTTON',
          button2: 'DELETE_BUTTON',
        },
      ];

      dialogs.forEach(dialog => {
        if (dialog.config?.stepsContent) {
          dialog.config.header = translations[dialog.header];
          dialog.config.stepsContent[0].text = translations[dialog.text];
          dialog.config.buttons[0].label = translations[dialog.button1];
          dialog.config.buttons[1].label = translations[dialog.button2];
        }
      });

      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.loadUsers(); // Carga de usuarios
    this.loadPendingUsers(); // Carga de usuarios pendientes
    this.loadRoles(); // Carga de roles

    // Carga las traducciones para las columnas
    this.loadTranslations();

    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateColumnsTranslations();
      this.updateDialogsTranslations();
      this.cdr.detectChanges();
    });

    this.cdr.detectChanges();
  }

  loadUsers(): void {
    this.userApiService
      .getAcceptedUsers()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: users => {
          this.myUsersData = users;
          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Error al cargar usuarios:', err);
        },
      });
  }

  loadRoles(): void {
    this.rolesApiService
      .getRoles()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: (roles: Role[]) => {
          // Mapeo de roles para el formulario de crear usuario
          const roleFieldNewUser = this.newUserConfig
            .find(group => group.groupName === 'Role information')
            ?.child.find(field => field.id === 'role');

          if (roleFieldNewUser) {
            roleFieldNewUser.values = roles.map(role => ({
              code: role.id,
              description: role.name,
            }));
          }

          // Mapeo de roles para el formulario de editar usuario
          const roleFieldEditUser = this.editUserForm
            .find(group => group.groupName === 'Edit information')
            ?.child.find(field => field.id === 'roleId');

          if (roleFieldEditUser) {
            roleFieldEditUser.values = roles.map(role => ({
              code: role.id,
              description: role.name,
            }));
          }

          // Actualizar los formularios en los componentes
          if (this.newDialogComponent) {
            this.newDialogComponent.updateForm(this.newUserConfig);
          }

          if (this.editUserDialogComponent) {
            this.editUserDialogComponent.updateForm(this.editUserForm);
          }

          this.cdr.detectChanges();
        },
        error: err => {
          console.error('Error al cargar los roles:', err);
        },
      });
  }

  loadUserDescription(): void {
    if (this.selectedRow?.id !== undefined) {
      this.userApiService
        .getUserDescriptionById(this.selectedRow?.id)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: description => {
            // Actualiza la configuración del diálogo con la descripción
            const descriptionField = this.newUserConfig
              .find(group => group.groupName === 'Personal data')
              ?.child.find(field => field.id === 'description');

            if (descriptionField) {
              descriptionField.value = description.description; // Actualiza el valor de la descripción
            }

            // Actualiza el diálogo usando el método updateForm
            if (this.newDialogComponent) {
              this.newDialogComponent.formConfig = this.acceptUserDialogConfig;
              this.newDialogComponent.updateForm(this.newUserConfig);
              this.showAcceptUserDialog = true;
            }

            this.cdr.detectChanges();
          },
          error: err => {
            console.error('Error al cargar la descripción del usuario:', err);
          },
        });
    } else {
      console.error('No user ID provided for acceptance.');
      this.closeDialog();
    }
  }

  loadUserForEdit(): void {
    if (this.selectedRow?.id !== undefined) {
      this.userApiService
        .getById(this.selectedRow.id)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: user => {
            // Rellena los campos del formulario
            this.editUserForm[0].child.forEach(field => {
              if (field.apiField) {
                field.value = user[field.apiField as keyof User];
              }
            });

            const roleField = this.editUserForm
              .find(group => group.groupName === 'Edit information')
              ?.child.find(field => field.id === 'roleId');

            if (roleField && user.role) {
              roleField.value = user.role.id;
            }

            // Actualiza la configuración del diálogo
            this.editUserDialogComponent.formConfig = this.editUserDialog;
            this.editUserDialogComponent.updateForm(this.editUserForm);
            this.showEditUser = true;
            this.cdr.detectChanges();
          },
          error: err => {
            console.error('Error loading user data for edit:', err);
          },
        });
    } else {
      console.error('No user ID provided for editing.');
      this.closeDialog();
    }
  }

  loadPendingUsers(): void {
    this.userApiService
      .getPendingUsers()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: users => {
          this.myPendingUsersData = users;
        },
        error: err => {
          console.error('Error al cargar usuarios:', err);
        },
      });
  }

  selectRow(row: User) {
    this.selectedRow = row;
  }

  onDeleteRow(row: User) {
    this.selectedRow = row;
    this.showDialog('delete');
  }

  onAcceptRow(row: User) {
    this.selectedRow = row;
    this.showDialog('accept');
  }

  onDeclineRow(row: User) {
    this.selectedRow = row;
    this.showDialog('decline');
  }

  onEditRow(row: User) {
    this.selectedRow = row;
    this.showDialog('edit');
  }

  showDialog(type: 'delete' | 'edit' | 'accept' | 'decline') {
    if (type === 'edit') {
      this.loadUserForEdit();
    } else if (type === 'delete') {
      this.showDeleteUser = true;
    } else if (type === 'accept') {
      this.loadUserDescription();
    } else if (type === 'decline') {
      this.showDeclineUserDialog = true;
    }
    this.cdr.detectChanges();
  }

  accept(): void {
    if (this.selectedRow?.id !== undefined) {
      const roleId = this.newDialogComponent?.getFormValue().role;

      this.userApiService
        .approveUser(this.selectedRow.id)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => {
            if (this.selectedRow?.id !== undefined) {
              this.userApiService
                .setRole(this.selectedRow?.id, roleId)
                .pipe(untilDestroyed(this))
                .subscribe({
                  next: () => {
                    this.loadPendingUsers();
                    this.loadUsers();
                    this.closeDialog();
                  },
                  error: error => {
                    console.error('Error setting user role:', error);
                    this.closeDialog();
                  },
                });
            }
          },
          error: error => {
            console.error('Error approving user:', error);
            this.closeDialog();
          },
        });
    } else {
      console.error('No user ID provided for acceptance.');
      this.closeDialog();
    }
  }

  delete(): void {
    if (this.showDeclineUserDialog) {
      if (this.selectedRow?.id !== undefined) {
        this.userApiService
          .declineUserById(this.selectedRow?.id)
          .pipe(untilDestroyed(this))
          .subscribe({
            next: () => {
              this.loadPendingUsers();
              this.loadUsers();
              this.closeDialog();
            },
            error: () => {
              this.closeDialog();
            },
          });
      }
    } else if (this.showDeleteUser) {
      if (this.selectedRow && this.selectedRow.id !== undefined) {
        this.userApiService.deleteUser(this.selectedRow.id).subscribe({
          next: () => {
            this.loadUsers();
            this.closeDialog();
          },
          error: error => {
            console.error('Error al eliminar el usuario:', error);
          },
        });
      } else {
        console.error(
          'No se ha seleccionado ningún usuario o el ID es inválido.'
        );
      }
    }
  }

  edit(): void {
    if (this.selectedRow?.id !== undefined) {
      const updatedUserData = this.editUserDialogComponent.getFormValue();
      this.userApiService
        .updateUser(this.selectedRow.id, updatedUserData)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => {
            this.loadUsers();
            this.closeDialog();
          },
          error: error => {
            console.error('Error updating user:', error);
          },
        });
    } else {
      this.closeDialog();
    }
  }

  closeDialog(): void {
    this.showAcceptUserDialog = false;
    this.showDeclineUserDialog = false;
    this.showDeleteUser = false;
    this.showEditUser = false;

    this.cdr.detectChanges();
  }
}
