import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FileUploadModule } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { ProgressBarModule } from 'primeng/progressbar';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import * as XLSX from 'xlsx';
import { UploadService } from '../../services/upload.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-upload-files',
  standalone: true,
  imports: [
    FileUploadModule,
    ButtonModule,
    BadgeModule,
    ProgressBarModule,
    ToastModule,
    CommonModule,
    ConfirmDialogModule,
  ],
  providers: [ConfirmationService],
  templateUrl: './upload-files.component.html',
  styleUrls: ['./upload-files.component.scss'],
})
export class UploadFilesComponent {
  @Input() uploadKey: number = 0;
  @Input() isVisible: boolean = true;
  @Input() isExcelUpload: boolean = false;
  @Input() imageType: boolean = false;
  @Input() is3DComponent: boolean = false;

  @Output() filesChange = new EventEmitter<any[]>();
  @Output() filesUploaded = new EventEmitter<{
    leftFiles: any[];
    rightFiles: any[];
  }>();
  @Output() excelDataLoaded = new EventEmitter<any[]>();

  files: Array<File | { name: string; url?: string }> = [];
  leftFiles: Array<File | { name: string; url?: string }> = [];
  rightFiles: Array<File | { name: string; url?: string }> = [];
  uploadedFilesHistory: Array<{ leftFiles: any[]; rightFiles: any[] }> = [];

  isDragging = false;
  totalSize: number = 0;

  constructor(
    private messageService: MessageService,
    private uploadService: UploadService,
    private confirmationService: ConfirmationService
  ) {}

  onFilesSelected(event: Event) {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(input.files);
  }

  onExcelFilesSelected(event: Event): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.files) this.addFiles(input.files);
  }

  addFiles(fileList: FileList | File[]) {
    const newFiles = Array.from(fileList);

    newFiles.forEach(file => {
      if (this.isExcelFile(file)) {
        this.processExcelFile(file);
      } else {
        this.files.push(file);
        this.classifyFiles();
      }
    });

    this.calculateTotalSize();
    this.filesChange.emit(this.files);
  }

  onFolderSelected(event: Event): void {
    event.preventDefault();
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const selectedFiles = Array.from(input.files);
      this.files.push(...selectedFiles);
      this.filesChange.emit(this.files);
    }
  }

  isExcelFile(file: any): boolean {
    return (
      file.name?.toLowerCase().endsWith('.xlsx') ||
      file.name?.toLowerCase().endsWith('.xls')
    );
  }

  processExcelFile(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const binaryData = e.target.result;
      const workbook: XLSX.WorkBook = XLSX.read(binaryData, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const excelData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      this.excelDataLoaded.emit(excelData);
    };
    reader.readAsBinaryString(file);
  }

  classifyFiles(): { leftFiles: any[]; rightFiles: any[] } {
    this.leftFiles = this.files.filter(file =>
      file.name?.toLowerCase().match(/(left|izq|izquierda|^l)/)
    );
    this.rightFiles = this.files.filter(file =>
      file.name?.toLowerCase().match(/(right|der|derecha|^r)/)
    );

    return { leftFiles: this.leftFiles, rightFiles: this.rightFiles };
  }

  calculateTotalSize() {
    this.totalSize = this.files.reduce(
      (sum, file: any) => sum + (file.size || 0),
      0
    );
  }

  confirmClearFiles() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete all files?',
      header: 'Confirm Deletion',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary',
      accept: () => {
        this.clearFiles();
      },
    });
  }

  onTemplatedUpload() {
    if (this.files.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'No Files',
        detail: 'No files selected for upload',
        life: 3000,
      });
      return;
    }

    this.uploadedFilesHistory.push({
      leftFiles: this.leftFiles,
      rightFiles: this.rightFiles,
    });
    this.filesUploaded.emit({
      leftFiles: this.leftFiles,
      rightFiles: this.rightFiles,
    });

    this.messageService.add({
      severity: 'info',
      summary: 'Success',
      detail: `${this.files.length} files uploaded`,
      life: 3000,
    });

    // this.clearFiles();
  }

  clearFiles() {
    if (!this.files || this.files.length === 0) return;

    const deleteObservables = this.files.map(file => {
      if (
        file &&
        'id' in file &&
        (typeof file.id === 'string' || typeof file.id === 'number')
      ) {
        const fileId = file.id.toString();
        return this.uploadService
          .deleteFile(fileId)
          .toPromise()
          .catch(err => {
            console.error(`Error al eliminar el archivo ${file.name}:`, err);
          });
      }
      return Promise.resolve();
    });

    Promise.all(deleteObservables).then(() => {
      // Limpiar arrays locales
      this.files = [];
      this.leftFiles = [];
      this.rightFiles = [];
      this.totalSize = 0;
      this.filesChange.emit(this.files);
    });
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    this.isDragging = true;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    this.isDragging = false;

    const filePromises: Promise<File[]>[] = [];
    if (event.dataTransfer?.items) {
      const items = Array.from(event.dataTransfer.items);
      items.forEach(item => {
        if (item.kind === 'file') {
          const entry = item.webkitGetAsEntry();
          if (entry) {
            if ((entry as FileSystemFileEntry).file) {
              const filePromise = new Promise<File[]>(resolve => {
                (entry as FileSystemFileEntry).file(file => {
                  Object.defineProperty(file, 'webkitRelativePath', {
                    value: entry.fullPath,
                  });
                  resolve([file]);
                });
              });
              filePromises.push(filePromise);
            } else if ((entry as FileSystemDirectoryEntry).isDirectory) {
              const directoryPromise = this.processDirectoryRecursive(
                entry as FileSystemDirectoryEntry
              );
              filePromises.push(directoryPromise);
            }
          }
        }
      });
    }

    Promise.all(filePromises).then(nestedFiles => {
      const allFiles = nestedFiles.flat();
      this.addFiles(allFiles);
    });
  }

  processDirectoryRecursive(
    directoryEntry: FileSystemDirectoryEntry
  ): Promise<File[]> {
    const directoryReader = directoryEntry.createReader();
    return new Promise<File[]>(resolve => {
      const readEntries = (): void => {
        directoryReader.readEntries(entries => {
          const entryPromises: Promise<File[]>[] = entries.map(entry => {
            if (entry.isFile) {
              return new Promise<File[]>(resolveFile => {
                (entry as FileSystemFileEntry).file(file => {
                  Object.defineProperty(file, 'webkitRelativePath', {
                    value: entry.fullPath,
                  });
                  resolveFile([file]);
                });
              });
            } else if (entry.isDirectory) {
              return this.processDirectoryRecursive(
                entry as FileSystemDirectoryEntry
              );
            }
            return Promise.resolve([]);
          });

          Promise.all(entryPromises).then(nestedFiles =>
            resolve(nestedFiles.flat())
          );
        });
      };
      readEntries();
    });
  }

  addFilesFromFolder(files: File[]) {
    files.forEach(file => {
      this.files.push(file);
    });

    this.classifyFiles();
    this.calculateTotalSize();
    this.filesChange.emit(this.files);
  }

  onDragLeave() {
    this.isDragging = false;
  }

  removeFile(index: number) {
    const file = this.files[index];

    if (
      file &&
      'id' in file &&
      (typeof file.id === 'string' || typeof file.id === 'number')
    ) {
      const fileId = file.id.toString(); // Asegúrate de pasar string al backend
      this.uploadService.deleteFile(fileId).subscribe({
        next: () => {
          this.files.splice(index, 1);
          this.classifyFiles();
          this.calculateTotalSize();
          this.filesChange.emit(this.files);
        },
        error: err => {
          console.error(`Error al eliminar el archivo ${file.name}:`, err);
        },
      });
    } else {
      // Archivo local, solo eliminar del array
      this.files.splice(index, 1);
      this.classifyFiles();
      this.calculateTotalSize();
      this.filesChange.emit(this.files);
    }
  }

  formatSize(bytes: number): string {
    if (!bytes || bytes === 0) return '—';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  isImageFile(file: any): boolean {
    const name = file.name?.toLowerCase() || '';
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  }

  getFilePreview(file: any): string {
    if (file instanceof File) return URL.createObjectURL(file);
    if (file.url) return file.url;
    return '';
  }

  setFiles(filesData: any[]) {
    if (!filesData || filesData.length === 0) return;

    // Caso de archivos planos tipo { link, name, ... }
    if (filesData[0] && 'link' in filesData[0]) {
      this.files = filesData.map((f: any) => this.normalizeFile(f));
      const classified = this.classifyFiles();
      this.leftFiles = classified.leftFiles;
      this.rightFiles = classified.rightFiles;
      this.calculateTotalSize();
      return;
    }

    // Tomamos el último elemento del historial
    const lastUpload = filesData[filesData.length - 1];

    const left = Array.isArray(lastUpload.leftFiles)
      ? lastUpload.leftFiles.map((f: any) => this.normalizeFile(f))
      : [];
    const right = Array.isArray(lastUpload.rightFiles)
      ? lastUpload.rightFiles.map((f: any) => this.normalizeFile(f))
      : [];

    // Filtrar según 2D / 3D
    if (this.is3DComponent) {
      this.leftFiles = left.filter((f: { name: string }) =>
        f.name?.toLowerCase().endsWith('.obj')
      );
      this.rightFiles = right.filter((f: { name: string }) =>
        f.name?.toLowerCase().endsWith('.obj')
      );
    } else {
      this.leftFiles = left.filter(
        (f: { name: string }) => !f.name?.toLowerCase().endsWith('.obj')
      );
      this.rightFiles = right.filter(
        (f: { name: string }) => !f.name?.toLowerCase().endsWith('.obj')
      );
    }

    // Archivos visibles en el componente
    this.files = [...this.leftFiles, ...this.rightFiles];
    this.calculateTotalSize();
  }

  private normalizeFile(
    file: any
  ): File | { name: string; url?: string; id?: string } {
    if (file instanceof File) return file;
    if (file.url)
      return { name: file.name || 'remote-file', url: file.url, id: file.id };
    if (file.link)
      return { name: file.name || 'remote-file', url: file.link, id: file.id };
    if (file.path)
      return { name: file.name || 'remote-file', url: file.path, id: file.id };
    if (file.downloadURL)
      return {
        name: file.name || 'remote-file',
        url: file.downloadURL,
        id: file.id,
      };
    return { name: file.name || 'unknown' };
  }

  private remoteFileSizes = new Map<string, string>();

  getFileSizeDisplay(file: File | { name: string; url?: string }): string {
    if ('size' in file && typeof file.size === 'number') {
      return this.formatSize(file.size);
    }

    if ('url' in file && file.url) {
      // Si ya tenemos cacheado el tamaño remoto
      const cached = this.remoteFileSizes.get(file.url);
      if (cached) return cached;

      // Marcamos como "pending" sin bloquear el render
      this.remoteFileSizes.set(file.url, 'Loading...');

      // Intentamos obtener el tamaño asincrónicamente SIN bloquear Angular
      this.fetchRemoteFileSize(file.url);

      return 'Loading...';
    }

    return '—';
  }

  private async fetchRemoteFileSize(url: string): Promise<void> {
    try {
      const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
      const sizeHeader = response.headers.get('Content-Length');

      let sizeText = 'Unknown size';
      if (sizeHeader) {
        sizeText = this.formatSize(parseInt(sizeHeader, 10));
      }

      // Cachear el resultado
      this.remoteFileSizes.set(url, sizeText);
    } catch (error) {
      // Evita que el navegador se llene de errores
      this.remoteFileSizes.set(url, 'Unavailable');
    }
  }

  getFileUrl(file: File | { name: string; url?: string }): string | null {
    if ('url' in file && file.url) {
      return file.url;
    }
    return null;
  }
}
