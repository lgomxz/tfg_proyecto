import { CommonModule, DatePipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { PdfViewerComponent } from '../../components/pdf-viewer/pdf-viewer.component';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { UserApiService } from '../../services/user-api.service';
import { RolesApiService } from '../../services/roles-api.service';
import { ToastService } from '../../components/toast/toast.service';
import { ToastType } from '../../components/toast/toast';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DocumentationService } from '../../services/documentation.service';
import { DialogConfig } from '../../components/new-dialog/dialog';
import { NewDialogComponent } from '../../components/new-dialog/new-dialog.component';

@UntilDestroy()
@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    PdfViewerComponent,
    MatButtonModule,
    TranslateModule,
    NewDialogComponent,
  ],
  templateUrl: './documentation.component.html',
  styleUrls: ['./documentation.component.scss'],
})
export class DocumentationComponent implements OnInit {
  documents: { name: string; createdAt: string; size: number }[] = [];
  selectedPdf: string | null = null;
  searchTerm: string = '';
  emailUser: string | undefined;
  showAdminButtons: boolean = false;

  visible = false;
  formConfig: DialogConfig | null = null;

  constructor(
    private http: HttpClient,
    private authApiService: AuthService,
    private userApiService: UserApiService,
    private rolesService: RolesApiService,
    private toastService: ToastService,
    private translate: TranslateService,
    private documentationService: DocumentationService
  ) {}

  ngOnInit() {
    this.loadDocuments();
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

                // Verificación de rol admin
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
  }

  loadDocuments() {
    this.documentationService.listDocuments().subscribe({
      next: docs => (this.documents = docs),
      error: err => console.error('Error loading documents:', err),
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    this.documentationService.uploadDocument(file).subscribe({
      next: res => {
        if (res.status === 'success') {
          this.loadDocuments();
          this.showToast('success');
        }
      },
      error: err => {
        console.error('Error al subir archivo:', err);
      },
    });
  }

  deleteDocument(filename: string) {
    this.showDeleteConfirmDialog(filename);
  }

  private showDeleteConfirmDialog(filename: string) {
    this.formConfig = {
      header: this.translate.instant('DIALOGS.DELETE_TITLE'),
      buttons: [
        {
          label: this.translate.instant('BUTTONS.CANCEL'),
          severity: 'secondary',
          action: () => this.closeDialog(),
        },
        {
          label: this.translate.instant('BUTTONS.DELETE'),
          severity: 'danger',
          action: () => this.confirmDelete(filename),
        },
      ],
      stepsContent: [
        {
          text: this.translate.instant('DIALOGS.DELETE_FILE'),
        },
      ],
    };
    this.visible = true;
  }

  private confirmDelete(filename: string) {
    this.documentationService.deleteDocument(filename).subscribe({
      next: res => {
        if (res.status === 'success') {
          this.toastService.show({
            severity: ToastType.SUCCESS,
            summary: 'Success',
            detail: 'Success deleting file',
          });
          this.loadDocuments();
        }
        this.closeDialog();
      },
      error: () => {
        this.toastService.show({
          severity: ToastType.ERROR,
          summary: 'Error',
          detail: 'Error deleting file',
        });
        this.closeDialog();
      },
    });
  }

  private closeDialog() {
    this.visible = false;
    this.formConfig = null;
  }

  showToast(succeeded: string) {
    if (succeeded === 'success') {
      this.translate.get('TOAST.SUCCESS.UPLOADED').subscribe(msg => {
        this.toastService.show({
          severity: ToastType.SUCCESS,
          summary: msg.SUMMARY,
          detail: msg.DETAIL,
        });
      });
    }
  }

  filteredDocuments() {
    return this.documents.filter(doc =>
      doc.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + ' ' + sizes[i];
  }

  openPdf(filename: string) {
    this.selectedPdf = filename;
  }

  closeViewer() {
    this.selectedPdf = null;
  }
}
