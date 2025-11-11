import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs/promises';
import * as fsSync from 'fs';

@Injectable()
export class DocumentationService {
  // Carpeta del servidor donde se van a guardar los archivos de la sección de documentos
  private readonly filesDir = path.join(process.cwd(), 'files');

  // Método para listar los archivos PDF
  async listPdfFiles() {
    const files = await fs.readdir(this.filesDir);
    // Filtrado por extensión
    const pdfFiles = files.filter((file) => file.endsWith('.pdf'));

    // Se obtiene la información de cada uno
    const stats = await Promise.all(
      pdfFiles.map(async (file) => {
        const filePath = path.join(this.filesDir, file);
        const stat = await fs.stat(filePath);
        return {
          name: file,
          size: stat.size, // tamaño en bytes
          modified: stat.mtime, // última modificación
        };
      }),
    );
    return stats;
  }

  // Método para subir un archivo a la carpeta files del servidor
  async uploadFile(file: Express.Multer.File) {
    const uploadDir = path.join(process.cwd(), 'files');
    const targetPath = path.join(uploadDir, file.originalname);

    // Crea el directorio si no existe
    if (!fsSync.existsSync(uploadDir)) {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    await fs.writeFile(targetPath, file.buffer);

    return { status: 'success', message: 'File loaded successfully' };
  }

  // Método para borrar un archivo de la carpeta files del servidor
  async deleteFile(filename: string) {
    const filePath = path.join(this.filesDir, filename);

    if (!fsSync.existsSync(filePath)) {
      throw new NotFoundException('File not found');
    }

    await fs.unlink(filePath);
    return { status: 'success', message: 'File deleted successfully' };
  }
}
