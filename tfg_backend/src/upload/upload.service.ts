import { Injectable } from '@nestjs/common';
import { bucket } from '../../config/firebase.config';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UploadService {
  private tempDir: string;

  constructor() {
    // Define un directorio temporal para procesar los archivos
    this.tempDir = path.join(__dirname, 'src/assets/3DModels/temp');
    // Se asegura de que la carpeta temporal exista
    if (!fs.existsSync(this.tempDir)) {
      fs.mkdirSync(this.tempDir, { recursive: true });
    }
  }

  // Ejecuta un comando del sistema operativo
  private async execCommand(cmd: string): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`Executing command: ${cmd}`);
      exec(cmd, { shell: 'cmd.exe' }, (error, stdout, stderr) => {
        if (error) {
          console.error('Error executing command', cmd, stderr);
          reject(error);
        } else {
          console.log(`Command executed successfully: ${cmd}`);
          resolve();
        }
      });
    });
  }

  /**
   * Modifica un archivo GLTF para hacer que todos los materiales sean "doubleSided"
   * (visibles desde ambos lados)
   */
  private async setDoubleSided(gltfFilePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(gltfFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading GLTF:', gltfFilePath, err);
          return reject(err);
        }

        let gltf;
        try {
          gltf = JSON.parse(data);
        } catch (parseError) {
          console.error('Error parsing file:', gltfFilePath, parseError);
          return reject(parseError);
        }

        // Si el archivo contiene materiales, se les añade la propiedad doubleSided = true
        if (gltf.materials) {
          gltf.materials.forEach(
            (material: any) => (material.doubleSided = true),
          );
        }

        // Se guarda el archivo con las modificaciones
        fs.writeFile(
          gltfFilePath,
          JSON.stringify(gltf, null, 2),
          'utf8',
          (err) => {
            if (err) {
              return reject(err);
            }

            resolve();
          },
        );
      });
    });
  }

  // Eliminar archivos temporales después de subir
  private cleanTempFiles() {
    fs.readdirSync(this.tempDir).forEach((file) => {
      const filePath = path.join(this.tempDir, file);
      if (fs.existsSync(filePath)) {
        // Verifica si el archivo existe
        try {
          fs.unlinkSync(filePath);
          console.log(`Temporary file deleted: ${filePath}`);
        } catch (error) {
          console.error(`Error deleting temporary file: ${filePath}`, error);
        }
      }
    });
  }

  // Revisa un archivo GLTF para comprobar si contiene imágenes o texturas
  private async checkGltfForImages(gltfFilePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(gltfFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading GLTF file:', gltfFilePath, err);
          return reject(err);
        }

        let gltf;
        try {
          gltf = JSON.parse(data);
        } catch (parseError) {
          return reject(parseError);
        }

        resolve();
      });
    });
  }

  // Revisa un archivo MTL (materiales de modelos OBJ) para identificar si usa texturas
  private async checkMtlForTextures(mtlFilePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      fs.readFile(mtlFilePath, 'utf8', (err, data) => {
        if (err) {
          console.error('Error reading MTL:', mtlFilePath, err);
          return reject(err);
        }

        const texturePaths: string[] = [];
        const lines = data.split('\n');
        lines.forEach((line) => {
          if (line.startsWith('map_Kd ')) {
            const texturePath = line.split(' ')[1].trim();
            texturePaths.push(texturePath);
          }
        });

        if (texturePaths.length > 0) {
          texturePaths.forEach((texturePath) =>
            console.log(`- ${texturePath}`),
          );
        }

        resolve();
      });
    });
  }

  /**
   * Sube los archivos al almacenamiento en Firebase
   * Si los archivos son 3D, se encarga de tratar texturas y modelo
   * Si son 2D, simplemente sube las imágenes.
   */
  async uploadFiles(
    files: Express.Multer.File[],
    is3D: boolean,
    relativePaths: string[],
    createdSubjectId: string,
  ): Promise<{ name: string; url: string }[]> {
    const downloadUrls: { name: string; url: string }[] = [];

    if (!Array.isArray(relativePaths)) {
      relativePaths = [relativePaths];
    }
    // Se agrupan los archivos por carpeta
    const filesGroupedByFolder = relativePaths.reduce(
      (acc, filePath) => {
        const folderName = path.dirname(filePath).split(path.sep).pop(); // Obtener solo el nombre de la carpeta
        if (!acc[folderName]) {
          acc[folderName] = [];
        }
        acc[folderName].push(filePath);
        return acc;
      },
      {} as Record<string, string[]>,
    );

    // Se procesan los archivos en cada carpeta de forma secuencial
    for (const folder in filesGroupedByFolder) {
      const filesInFolder = filesGroupedByFolder[folder];
      console.log(`Archivos en la carpeta "${folder}":`, filesInFolder);
      // Determina si se trata de un modelo 3D
      if (is3D) {
        // Filtra el archivo .obj del grupo actual
        const objFilePath = filesInFolder.find((file) => file.endsWith('.obj'));
        const mtlFilePath = filesInFolder.find((file) => file.endsWith('.mtl'));

        if (objFilePath && mtlFilePath) {
          // Obtiene el archivo .obj directamente del array de files
          const objFile = files.find(
            (f) => f.originalname === path.basename(objFilePath),
          );
          // Obtiene el archivo .mtl directamente del array de files
          const mtlFile = files.find(
            (f) => f.originalname === path.basename(mtlFilePath),
          );

          // Filtra las texturas directamente del array de files
          const textureFiles = files.filter((file) => {
            const isInFolder = filesInFolder.some((filePath) =>
              filePath.endsWith(file.originalname),
            );
            const isImage = /\.(jpg|jpeg|png)$/i.test(file.originalname);
            return isInFolder && isImage;
          });

          if (!objFile) {
            continue; // Saltar a la siguiente carpeta si no se encuentra el OBJ
          }

          try {
            // Guarda el archivo MTL en la carpeta temporal
            const mtlFilePathTemp = path.join(
              this.tempDir,
              mtlFile.originalname,
            );
            fs.writeFileSync(mtlFilePathTemp, mtlFile.buffer);

            // Verifica el contenido del archivo MTL
            await this.checkMtlForTextures(mtlFilePathTemp);

            const modelUrls = await this.processAndUpload3DModel(
              objFile,
              mtlFile,
              textureFiles,
              folder,
              createdSubjectId,
            );

            // Agregamos todas las URLs al array de descargas
            downloadUrls.push(...modelUrls);
          } catch (error) {
            console.error(
              `Error uploading OBJ files ${path.basename(objFilePath)}:`,
              error,
            );
            throw error;
          }
        }
      } else {
        // Para archivos 2D
        for (const filePath of filesInFolder) {
          const matchingFile = files.find(
            (f) => f.originalname === path.basename(filePath),
          );

          if (matchingFile) {
            try {
              const fileId = uuidv4();
              const localPath = path.join(
                this.tempDir,
                matchingFile.originalname,
              );
              fs.writeFileSync(localPath, matchingFile.buffer);

              // Se limpia el nombre de la carpeta
              const folderClean = folder
                .replace(/\\/g, '/') // backslash
                .replace(/^(\.\/)+/, '') // elimina todos los ./ al inicio
                .replace(/^\/+|\/+$/g, ''); // elimina slashes al inicio/final

              const pathInBucket = folderClean
                ? `images/${createdSubjectId}/${folderClean}/${fileId}-${matchingFile.originalname}`
                : `images/${createdSubjectId}/${fileId}-${matchingFile.originalname}`;

              const fileUpload = bucket.file(pathInBucket);

              await new Promise<void>((resolve, reject) => {
                fs.createReadStream(localPath)
                  .pipe(
                    fileUpload.createWriteStream({
                      metadata: {
                        contentType: matchingFile.mimetype,
                      },
                    }),
                  )
                  .on('finish', () => {
                    resolve();
                  })
                  .on('error', (error) => {
                    reject(error);
                  });
              });

              // Se genera un id úindo como token de accso a firebase
              const downloadToken = uuidv4();

              // Se establecen los metadatos del archivo a subir
              await fileUpload.setMetadata({
                metadata: {
                  firebaseStorageDownloadTokens: downloadToken,
                },
              });

              //Se construye el enlace público de descarga
              const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(fileUpload.name)}?alt=media&token=${downloadToken}`;

              // Se guarda en el array de resultados el nombre original del archivo y su URL
              downloadUrls.push({
                name: matchingFile.originalname,
                url: downloadUrl,
              });
            } catch (error) {
              console.error('Error al subir archivo 2D:', error);
              throw error;
            }
          }
        }
      }
    }

    return downloadUrls;
  }

  // Método principal para procesar y subir modelos 3D (OBJ + MTL + Texturas)
  async processAndUpload3DModel(
    objFile: Express.Multer.File,
    mtlFile: Express.Multer.File,
    textureFiles: Express.Multer.File[], // Recibe las texturas
    folderName: string, // Recibe el nombre de la carpeta
    createdSubjectId: string,
  ): Promise<{ name: string; url: string }[]> {
    // Nombres y rutas temporales
    const fileName = objFile.originalname;
    const filePath = path.join(this.tempDir, fileName);
    const mtlFileName = mtlFile.originalname;
    const mtlFilePath = path.join(this.tempDir, mtlFileName);
    const baseName = path.basename(fileName, path.extname(fileName)); // Nombre del archivo sin extensión

    // Guarda el archivo 3D y el archivo MTL en la carpeta temporal
    fs.writeFileSync(filePath, objFile.buffer);
    fs.writeFileSync(mtlFilePath, mtlFile.buffer);

    const outputFileName = `${baseName}.gltf`;
    const outputFilePath = path.join(this.tempDir, outputFileName);

    // Compresión de texturas con ImageMagick
    const texturePromises = textureFiles.map(async (texture) => {
      const texturePath = path.join(this.tempDir, texture.originalname);
      fs.writeFileSync(texturePath, texture.buffer); // Guardar textura en la carpeta temporal
      console.log(`Comenzando la compresión de textura: ${texturePath}`);
      try {
        await this.execCommand(
          `magick "${texturePath}" -resize 2048x2048 -quality 100 "${texturePath}"`,
        );
        console.log(`Textura comprimida: ${texturePath}`);
      } catch (error) {
        console.error(`Error al comprimir la textura ${texturePath}:`, error);
        throw error;
      }
    });

    await Promise.all(texturePromises);

    // Verifica que las imágenes existen en el directorio temporal antes de la conversión
    const textureFilesExist = textureFiles.every((texture) => {
      const texturePath = path.join(this.tempDir, texture.originalname);
      return fs.existsSync(texturePath);
    });

    // Se suben las texturas a Firebase y se obtienen las URLs de descarga
    const textureUploadPromises = textureFiles.map((texture) => {
      const texturePath = path.join(this.tempDir, texture.originalname);
      const textureUpload = bucket.file(
        `models/${createdSubjectId}/${folderName.replace(/^\/+|\/+$/g, '')}/${texture.originalname}`,
      );

      return new Promise<{ name: string; url: string }>((resolve, reject) => {
        fs.createReadStream(texturePath)
          .pipe(
            textureUpload.createWriteStream({
              metadata: {
                contentType: texture.mimetype,
              },
            }),
          )
          .on('finish', async () => {
            // Se genera un token único para el acceso directo
            const downloadToken = uuidv4();
            await textureUpload.setMetadata({
              metadata: {
                firebaseStorageDownloadTokens: downloadToken,
              },
            });
            // Se crea la URL de descarga pública
            const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(textureUpload.name)}?alt=media&token=${downloadToken}`;

            resolve({ name: texture.originalname, url: downloadUrl });
          })
          .on('error', (error) => {
            console.error(
              `Error al subir la textura: ${textureUpload.name}`,
              error,
            );
            reject(error);
          });
      });
    });

    // Procesado y conversión de OBJ a GLTF
    let gltfData;
    let textureUrls: { name: string; url: string }[] = []; // Definir textureUrls aquí

    try {
      console.log('Esperando la compresión de texturas...');
      await Promise.all(texturePromises);
      console.log('Compresión de texturas completada.');

      // Ejecuta la conversión con obj2gltf (mantiene texturas separadas)
      console.log(`Iniciando la conversión de ${filePath} a ${outputFilePath}`);
      await this.execCommand(
        `obj2gltf -i "${filePath}" -o "${outputFilePath}" --textures-dir "${this.tempDir}" --separate --draco.compressMeshes=false`,
      );
      console.log(`Conversión a GLTF completada: ${outputFilePath}`);

      // Comprueba si el archivo GLTF contiene imágenes
      await this.checkGltfForImages(outputFilePath);

      await this.setDoubleSided(outputFilePath);

      // Elimina el archivo .obj después de la conversión
      fs.unlinkSync(filePath);

      // Cargamos el GLTF resultante en memoria
      gltfData = JSON.parse(fs.readFileSync(outputFilePath, 'utf8'));
    } catch (error) {
      console.error('Error during conversion:', error);
      throw error;
    }

    // Se sube el archivo BIN a Firebase y se obtiene la URL de descarga
    const binFilePath = path.join(this.tempDir, `${baseName}.bin`);
    const binFileUpload = bucket.file(
      `models/${createdSubjectId}/${folderName.replace(/^\/+|\/+$/g, '')}/${baseName}.bin`,
    );
    let binDownloadUrl: { name: string; url: string } = {
      name: `${baseName}.bin`,
      url: '',
    };

    // Si existe archivo .bin (datos binarios del modelo), se sube también
    if (fs.existsSync(binFilePath)) {
      await new Promise<void>((resolve, reject) => {
        fs.createReadStream(binFilePath)
          .pipe(
            binFileUpload.createWriteStream({
              metadata: {
                contentType: 'application/octet-stream',
              },
            }),
          )
          .on('finish', async () => {
            const binDownloadToken = uuidv4();

            await binFileUpload.setMetadata({
              metadata: {
                firebaseStorageDownloadTokens: binDownloadToken,
              },
            });

            binDownloadUrl.url = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(binFileUpload.name)}?alt=media&token=${binDownloadToken}`;

            resolve();
          })
          .on('error', (error) => {
            console.error(`Error uploading file: ${binFileUpload.name}`, error);
            reject(error);
          });
      });
    }

    // Modifica el archivo GLTF para actualizar el URI del archivo BIN y texturas
    if (gltfData.buffers && gltfData.buffers.length > 0) {
      gltfData.buffers[0].uri = binDownloadUrl.url; // Actualiza el URI al archivo BIN con la URL generada
    }

    if (!gltfData.images) {
      console.error('GLTF file does not contain images.');
    } else {
      textureUrls = await Promise.all(textureUploadPromises);
      textureUrls.forEach((urlObj) => {
        const textureName = urlObj.name;
        const image = gltfData.images.find(
          (img: any) => img.uri === textureName,
        );

        if (image) {
          image.uri = urlObj.url; // Actualiza el URI de la textura con la URL generada
        }
      });
    }

    fs.writeFileSync(outputFilePath, JSON.stringify(gltfData, null, 2), 'utf8');

    // Se sube el archivo procesado (GLTF) a Firebase
    const gltfFileUpload = bucket.file(
      `models/${createdSubjectId}/${folderName.replace(/^\/+|\/+$/g, '')}/${outputFileName}`,
    );

    const gltfDownloadUrl = await new Promise<{ name: string; url: string }>(
      (resolve, reject) => {
        fs.createReadStream(outputFilePath)
          .pipe(
            gltfFileUpload.createWriteStream({
              metadata: {
                contentType: 'model/gltf+json',
              },
            }),
          )
          .on('finish', async () => {
            console.log(`GLTF file uploaded: ${gltfFileUpload.name}`);
            const downloadToken = uuidv4();
            await gltfFileUpload.setMetadata({
              metadata: {
                firebaseStorageDownloadTokens: downloadToken,
              },
            });
            const downloadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket.name}/o/${encodeURIComponent(gltfFileUpload.name)}?alt=media&token=${downloadToken}`;

            resolve({ name: outputFileName, url: downloadUrl });
          })
          .on('error', (error) => {
            reject(error);
          });
      },
    );

    // Limpieza de archivos temporales después de la carga
    this.cleanTempFiles();

    // Se crea un array para las URLs que incluyen tanto el modelo GLTF como las texturas
    const allUrls: { name: string; url: string }[] = [gltfDownloadUrl];

    return allUrls; // Devuelve todas las URLs, GLTF + texturas
  }

  // Método para borrar un archivo de Firebase
  async deleteFile(fileUrl: string): Promise<void> {
    try {
      if (!fileUrl) {
        throw new Error('No se proporcionó URL del archivo');
      }

      // Extrae el path relativo dentro del bucket
      const bucketPath = decodeURIComponent(
        fileUrl.split(`/o/`)[1].split(`?`)[0],
      );
      const file = bucket.file(bucketPath);

      await file.delete();
    } catch (error) {
      throw error;
    }
  }
}
