import { CommonModule } from '@angular/common';
import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  ChangeDetectorRef,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { TableComponent } from '../../components/table/table.component';
import { ColumnsConfig } from '../../components/table/table';
import { DialogModule } from 'primeng/dialog';
import { NewDialogComponent } from '../../components/new-dialog/new-dialog.component';
import {
  CollectionFormConfig,
  FormInputType,
  FormInputWidth,
} from '../../components/form/form';
import { DialogConfig } from '../../components/new-dialog/dialog';
import { Router, RouterModule } from '@angular/router';
import { CollectionApiService } from '../../services/collection-service.service';
import { Collection } from '../../models/collection';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { User } from '../../models/user';
import { AuthService } from '../../services/auth.service';
import { UserApiService } from '../../services/user-api.service';
import { RolesApiService } from '../../services/roles-api.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { UserCollectionsService } from '../../services/user-collections.service';
import { ToastService } from '../../components/toast/toast.service';
import { ToastType } from '../../components/toast/toast';
import { TabViewModule } from 'primeng/tabview';

@UntilDestroy()
@Component({
  selector: 'app-collections',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatTableModule,
    InputTextModule,
    ButtonModule,
    MatButtonModule,
    MatIconModule,
    MatPaginatorModule,
    TableComponent,
    DialogModule,
    NewDialogComponent,
    FormsModule,
    RouterModule,
    TranslateModule,
    TabViewModule,
  ],
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainPageComponent implements OnInit {
  @ViewChild(NewDialogComponent) newCollectionDialogRef!: NewDialogComponent;

  private _userId?: string;

  selectedRow?: Collection;
  isEditing: boolean = false; // Para distinguir si estamos editando o creando
  emailUser: string | undefined;
  user!: User;
  showAdminButtons: boolean = false;
  isAssignMode: boolean = false;
  selectedCollections: Collection[] = [];
  label_button = 'Assign';
  users: User[] = [];
  searchTerm: string = '';
  selectedUsers: User[] = [];
  showNewCollectionDialog: boolean = false;
  showDeleteCollectionDialog: boolean = false;
  showAssignDialog: boolean = false;
  activeTabIndex: number = 0;
  myCollections: Collection[] = [];
  allCollections: Collection[] = [];

  // Configuración de formularios
  newCollectionForm: CollectionFormConfig[] = [
    {
      groupName: 'Please enter the name of the new collection.',
      child: [
        {
          id: 'collectionName',
          apiField: 'collectionName',
          label: 'New collection name',
          type: FormInputType.TEXT,
          mandatory: true,
          width: FormInputWidth.FULL,
          value: '',
        },
      ],
    },
  ];

  // Configuración de diálogos
  newCollectionDialogConfig: DialogConfig = {
    header: 'New Collection',
    stepsContent: [{ showForm: true, formConfig: this.newCollectionForm }],
    buttons: [
      {
        label: 'Cancel',
        action: () => this.closeDialog(),
        severity: 'secondary',
      },
      {
        label: 'Save',
        action: () => {
          const formData = this.newCollectionDialogRef.getFormValue();
          this.accept(formData);
        },
        severity: 'primary',
      },
    ],
    showStepper: false,
  };

  assignCollectionDialogConfig: DialogConfig = {
    header: 'Assign Collection(s)',
    stepsContent: [
      {
        showForm: false,
        formConfig: [],
        customSelector: {
          items: this.users,
          displayFields: ['name', 'lastname', 'email'],
          identifier: 'id',
          searchPlaceholder: 'Search user...',
          displayTemplate: user => ({
            title: `${user.name} ${user.lastname}`,
            subtitle: user.email,
          }),
        },
      },
    ],
    buttons: [
      {
        label: 'Cancel',
        action: () => this.closeDialog(),
        severity: 'secondary',
      },
      { label: 'Assign', action: () => this.assign(), severity: 'primary' },
    ],
    showStepper: false,
  };

  deleteCollectionDialogConfig: DialogConfig = {
    header: 'Delete Collection',
    stepsContent: [
      {
        text: 'Are you sure you want to delete this collection?',
        formConfig: [],
      },
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

  collectionsColumns: ColumnsConfig[] = [
    { title: 'ID', apiField: 'shortId' },
    { title: 'Collection name', apiField: 'name' },
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('searchText') input!: ElementRef<HTMLInputElement>;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private collectionService: CollectionApiService,
    private authApiService: AuthService,
    private userApiService: UserApiService,
    private rolesService: RolesApiService,
    private translate: TranslateService,
    private userCollectionService: UserCollectionsService,
    private toastService: ToastService
  ) {}

  private updateColumnsTranslations() {
    this.translate.get('MAIN_COLUMNS').subscribe((translations: any) => {
      this.collectionsColumns = [
        { title: translations['ID'], apiField: 'shortId' },
        { title: translations['COLLECTION_NAME'], apiField: 'name' },
      ];
      this.cdr.detectChanges();
    });
  }

  private updateDialogTranslations() {
    this.translate.get('DIALOGS').subscribe((translations: any) => {
      // Traducción del diálogo de nueva colección
      this.newCollectionDialogConfig.header =
        translations['NEW_COLLECTION_HEADER'];
      this.newCollectionForm[0].groupName = translations['NEW_COLLECTION_TEXT'];
      this.newCollectionForm[0].child[0].label =
        translations['NEW_COLLECTION_INPUT_LABEL'];

      this.newCollectionDialogConfig.buttons = [
        {
          label: translations['CANCEL_BUTTON'],
          action: () => this.closeDialog(),
          severity: 'secondary',
        },
        {
          label: translations['SAVE_BUTTON'],
          action: () => {
            const formData = this.newCollectionDialogRef.getFormValue();
            this.accept(formData);
          },
          severity: 'primary',
        },
      ];

      // Traducción del diálogo de edición de colección
      if (this.isEditing) {
        this.newCollectionDialogConfig.header =
          translations['EDIT_COLLECTION_HEADER'];
        this.newCollectionForm[0].groupName =
          translations['EDIT_COLLECTION_TEXT'];
        this.newCollectionForm[0].child[0].label =
          translations['EDIT_COLLECTION_INPUT_LABEL'];
      }

      // Traducción del diálogo de eliminación de colección
      this.deleteCollectionDialogConfig.header =
        translations['DELETE_COLLECTION_HEADER'];

      if (this.deleteCollectionDialogConfig.stepsContent?.length) {
        this.deleteCollectionDialogConfig.stepsContent[0].text =
          translations['DELETE_COLLECTION_TEXT'];
      }

      this.deleteCollectionDialogConfig.buttons = [
        {
          label: translations['CANCEL_BUTTON'],
          action: () => this.closeDialog(),
          severity: 'secondary',
        },
        {
          label: translations['DELETE_BUTTON'],
          action: () => this.delete(),
          severity: 'primary',
        },
      ];

      this.cdr.detectChanges();
    });
  }

  private updateAssignDialogTranslations(): void {
    this.translate.get('DIALOGS').subscribe((translations: any) => {
      this.assignCollectionDialogConfig.header =
        translations['ASSIGN_COLLECTION_HEADER'];

      if (this.assignCollectionDialogConfig.stepsContent?.length) {
        this.assignCollectionDialogConfig.stepsContent[0].customSelector!.searchPlaceholder =
          translations['SEARCH_USER_PLACEHOLDER'];
      }

      this.assignCollectionDialogConfig.buttons = [
        {
          label: translations['CANCEL_BUTTON'],
          action: () => this.closeDialog(),
          severity: 'secondary',
        },
        {
          label: translations['ASSIGN_BUTTON'],
          action: () => this.assign(),
          severity: 'primary',
        },
      ];

      this.cdr.detectChanges();
    });
  }

  ngOnInit(): void {
    this.updateColumnsTranslations();
    this.updateDialogTranslations();
    this.updateButtonLabel();
    this.updateAssignDialogTranslations();
    this.authApiService
      .getUserId()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: id => {
          if (id !== null && !this._userId) {
            // asigna solo si no está asignado
            this._userId = id;
            this.loadCollections(this._userId);
            this.loadAllCollections();
          }
        },
        error: error => {
          console.error('Error al obtener el user ID:', error);
        },
      });

    this.authApiService
      .getUserEmail()
      .pipe(untilDestroyed(this))
      .subscribe({
        next: email => {
          this.emailUser = email || 'default@example.com';

          // Obtener el roleId directamente
          this.userApiService
            .getRoleIdByEmail(this.emailUser)
            .pipe(untilDestroyed(this))
            .subscribe({
              next: response => {
                const roleId = response.roleId;

                this.rolesService
                  .getRoleById(roleId)
                  .pipe(untilDestroyed(this))
                  .subscribe({
                    next: role => {
                      if (role.name.toLowerCase() === 'admin') {
                        this.showAdminButtons = true;
                      }
                    },
                    error: (error: Error) => {
                      console.error('Error fetching role name:', error);
                    },
                  });
              },
              error: error => {
                console.error('Error al obtener el role ID:', error);
              },
            });
        },
        error: () => {
          console.error('Error al obtener el email');
        },
      });

    // Escuchar futuros cambios de idioma
    this.translate.onLangChange.pipe(untilDestroyed(this)).subscribe(() => {
      this.updateColumnsTranslations();
      this.updateDialogTranslations();
      this.updateButtonLabel();
      this.updateAssignDialogTranslations();

      this.cdr.detectChanges();
    });
  }

  loadCollections(userId: string) {
    this.userCollectionService.getCollectionsByUserId(userId).subscribe({
      next: collections => {
        this.myCollections = collections; // Asigna los datos obtenidos
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading collections:', err); // Muestra un error si falla la petición
      },
    });
  }

  loadAllCollections() {
    this.collectionService.getCollections().subscribe({
      next: collections => {
        this.allCollections = collections; // Asigna los datos obtenidos
        this.cdr.detectChanges();
      },
      error: err => {
        console.error('Error loading collections:', err); // Muestra un error si falla la petición
      },
    });
  }

  selectRow(row: Collection) {
    this.selectedRow = row;
  }
  // Método que se llama cuando se recibe el evento de eliminar
  onDeleteRow(row: Collection) {
    this.selectedRow = row;
    this.showDialog('delete');
  }

  // Método que se llama cuando se recibe el evento de editar
  onEditRow(row: Collection) {
    this.selectedRow = row;
    this.showDialog('edit');
  }

  showDialog(type: 'new' | 'delete' | 'edit') {
    this.translate.get('DIALOGS').subscribe((translations: any) => {
      if (type === 'new') {
        // Para crear una nueva colección
        this.newCollectionDialogConfig.header =
          translations['NEW_COLLECTION_HEADER'];
        this.newCollectionForm[0].groupName =
          translations['NEW_COLLECTION_TEXT'];
        this.newCollectionForm[0].child[0].label =
          translations['NEW_COLLECTION_INPUT_LABEL'];
        this.showNewCollectionDialog = true;
      } else if (type === 'delete') {
        // Para eliminar una colección
        this.deleteCollectionDialogConfig.header =
          translations['DELETE_COLLECTION_HEADER'];
        if (this.deleteCollectionDialogConfig.stepsContent?.length) {
          this.deleteCollectionDialogConfig.stepsContent[0].text =
            translations['DELETE_COLLECTION_TEXT'];
        }
        this.deleteCollectionDialogConfig.buttons = [
          {
            label: translations['CANCEL_BUTTON'],
            action: () => this.closeDialog(),
            severity: 'secondary',
          },
          {
            label: translations['DELETE_BUTTON'],
            action: () => this.delete(),
            severity: 'primary',
          },
        ];
        this.showDeleteCollectionDialog = true;
      } else if (type === 'edit') {
        this.newCollectionDialogConfig.header =
          translations['EDIT_COLLECTION_HEADER'];
        this.newCollectionForm[0].groupName =
          translations['EDIT_COLLECTION_TEXT'];
        this.newCollectionForm[0].child[0].label =
          translations['EDIT_COLLECTION_INPUT_LABEL'];

        if (this.selectedRow) {
          this.newCollectionForm[0].child[0].value =
            this.selectedRow.name || '';
        }
        this.newCollectionDialogRef.updateForm(this.newCollectionForm);

        this.isEditing = true;
        this.showNewCollectionDialog = true;
      }

      this.cdr.detectChanges();
    });
  }

  applyFilter(searchText: string) {
    this.searchTerm = searchText;
  }

  clearFilter() {
    this.input.nativeElement.value = '';
    this.loadCollections(this._userId!);
  }

  closeDialog() {
    this.showNewCollectionDialog = false;
    this.showDeleteCollectionDialog = false;
    this.showAssignDialog = false;
    this.selectedCollections = [];
    this.isAssignMode = false;
  }

  openSamples(row: Collection): void {
    this.router.navigate(['pubis'], {
      queryParams: { shortId: row.shortId },
    });
  }

  getSelectedUsers(users: User[]) {
    this.selectedUsers = users;
  }

  assign(): void {
    const userIds = this.selectedUsers
      .map(user => user.id)
      .filter((id): id is string => id !== undefined);
    const collectionIds = this.selectedCollections
      .map(c => c.id)
      .filter((id): id is string => id !== undefined);

    this.userCollectionService
      .assignCollectionsToUsers(userIds, collectionIds)
      .subscribe({
        next: () => {
          this.translate
            .get('TOAST.SUCCESS.COLLECTION_ASSIGNED')
            .subscribe(msg => {
              this.toastService.show({
                severity: ToastType.SUCCESS,
                summary: msg.SUMMARY,
                detail: msg.DETAIL,
              });
            });
          this.closeDialog();
          this.loadCollections(this._userId!);
        },
        error: error => {
          console.error('Error al asignar colecciones:', error);
        },
      });
  }

  accept(formData: any) {
    //revisar
    const collection: Collection = {
      id: this.isEditing ? this.selectedRow?.id : undefined,
      shortId: this.isEditing ? this.selectedRow?.id : undefined,
      name: formData.collectionName,
    };

    if (!this.isEditing) {
      this.collectionService
        .createCollection(collection)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: createdCollection => {
            this.loadCollections(this._userId!);
            this.selectedRow = createdCollection;
            this.cdr.detectChanges();
            this.closeDialog();
          },
          error: error => {
            console.error('Error al guardar la colección:', error);
          },
        });
    } else if (this.isEditing) {
      this.collectionService
        .editCollection(collection)
        .pipe(untilDestroyed(this))
        .subscribe({
          next: () => {
            this.loadCollections(this._userId!);
            this.closeDialog();
          },
          error: error => {
            console.error('Error al editar la colección:', error);
          },
        });
    }
  }

  delete() {
    if (this.selectedRow && this.selectedRow.id !== undefined) {
      this.collectionService.deleteCollection(this.selectedRow.id).subscribe({
        next: () => {
          this.loadCollections(this._userId!);
          this.closeDialog();
        },
        error: error => {
          console.error('Error al eliminar la colección:', error);
        },
      });
    } else {
      console.error(
        'No se ha seleccionado ninguna colección o el ID es inválido.'
      );
    }
  }

  loadUsers() {
    this.userApiService.getAllUsers().subscribe({
      next: users => {
        this.users = users;
        if (this.assignCollectionDialogConfig.stepsContent?.[0]) {
          this.assignCollectionDialogConfig.stepsContent[0].customSelector = {
            items: this.users,
            displayFields: ['name', 'lastname', 'email'],
            identifier: 'id',
            searchPlaceholder: 'Search user...',
            displayTemplate: user => ({
              title: `${user.name} ${user.lastname}`,
              subtitle: user.email,
            }),
          };
        }

        this.updateAssignDialogTranslations();

        this.cdr.detectChanges();
      },
      error: error => {
        console.error('Error loading users:', error);
      },
    });
  }

  private updateButtonLabel(): void {
    this.translate.get('BUTTONS').subscribe(translations => {
      this.label_button = this.isAssignMode
        ? translations.CANCEL
        : translations.ASSIGN;

      this.cdr.detectChanges();
    });
  }

  toggleAssignMode() {
    if (this.selectedCollections.length > 0) {
      this.showAssignDialog = true;
      this.loadUsers();
    }
    this.isAssignMode = !this.isAssignMode;
    this.updateButtonLabel();
  }

  onSelectedCollectionsChange(selectedRows: Collection[]): void {
    if (!selectedRows) return;

    // Añadir nuevos
    for (const item of selectedRows) {
      const exists = this.selectedCollections.some(c => c.id === item.id);
      if (!exists) {
        this.selectedCollections.push(item);
      }
    }

    // Quitar los que ya no están seleccionados
    this.selectedCollections = this.selectedCollections.filter(c =>
      selectedRows.some(s => s.id === c.id)
    );
    if (this.selectedCollections.length === 0) this.label_button = 'Cancel';
    if (this.selectedCollections.length > 0) this.label_button = 'Confirm';
  }

  get filteredCollections(): Collection[] {
    const term = this.searchTerm.toLowerCase().trim();

    const baseCollections =
      this.activeTabIndex === 0 ? this.myCollections : this.allCollections;

    if (!term) {
      return baseCollections;
    }

    return baseCollections.filter(
      collection =>
        collection.name.toLowerCase().includes(term) ||
        (collection.shortId && collection.shortId.toLowerCase().includes(term))
    );
  }
}
