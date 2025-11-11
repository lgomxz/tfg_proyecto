var fs = require('fs');
var path = require('path');
var exec = require('child_process').exec;

var inputDir = path.join(__dirname, 'src/assets/3DModels/input');
var outputDir = path.join(__dirname, 'src/assets/3DModels/output');

// Crear la carpeta de salida si no existe
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Función para ejecutar un comando de consola y esperar su finalización
function execCommand(cmd) {
  return new Promise(function(resolve, reject) {

    exec(cmd, { shell: true }, function(error, stdout, stderr) {
      if (error) {
        console.error('Error ejecutando el comando: ' + cmd);
        console.error('Código de error: ', error.code);
        console.error('stderr: ', stderr);
        reject(error);
      } else {

        resolve();
      }
    });
  });
}

// Función para establecer doubleSided a true en el archivo glTF
function setDoubleSided(gltfFilePath) {
  return new Promise(function(resolve, reject) {
    fs.readFile(gltfFilePath, 'utf8', function(err, data) {
      if (err) {
        return reject(err); // Rechaza si hay un error al leer
      }

      var gltf;
      try {
        gltf = JSON.parse(data); // Parsear el archivo JSON
      } catch (parseError) {
        return reject(parseError); // Rechaza si hay un error al parsear
      }

      // Establecer doubleSided a true en cada material
      if (gltf.materials) {
        gltf.materials.forEach(function(material) {
          material.doubleSided = true; // Establecer doubleSided a true
        });
      }

      // Guardar el archivo modificado
      fs.writeFile(gltfFilePath, JSON.stringify(gltf, null, 2), 'utf8', function(err) {
        if (err) {
          return reject(err); // Rechaza si hay un error al escribir
        }
        resolve(); // Resuelve la promesa
      });
    });
  });
}

// Obtener todos los archivos OBJ de la carpeta de entrada
fs.readdir(inputDir, function(err, files) {
  if (err) {
    console.error('Error leyendo el directorio', err);
    return;
  }

  // Filtrar solo los archivos OBJ
  var objFiles = files.filter(function(file) {
    return path.extname(file).toLowerCase() === '.obj';
  });

  // Procesar cada archivo OBJ
  objFiles.forEach(function(file) {
    var inputFilePath = path.join(inputDir, file);
    var outputFileName = path.basename(file, '.obj') + '.gltf';
    var outputFilePath = path.join(outputDir, outputFileName);

    // Comprimir las texturas a un tamaño razonable (2048x2048 o 1024x1024 según lo necesitado)
    var textureFiles = files.filter(function(file) {
      return /\.(jpg|jpeg|png)$/i.test(file); // Filtrar imágenes JPG, JPEG y PNG
    });

    var texturePromises = textureFiles.map(function(textureFile) {
      var texturePath = path.join(inputDir, textureFile); // Ruta original de las texturas en input
      // Ajustar el tamaño de las texturas a 2048x2048 y mantener calidad 100%
      return execCommand('magick "' + texturePath + '" -resize 2048x2048 -quality 100 "' + texturePath + '"');
    });

    // Procesar las texturas primero
    Promise.all(texturePromises)
      .then(function() {
        console.log('Texturas comprimidas para ' + file + '. Ahora convirtiendo a glTF...');

        // Convertir OBJ a GLTF sin compresión
        return execCommand('obj2gltf -i "' + inputFilePath + '" -o "' + outputFilePath + '" --textures-dir "' + inputDir + '" --separate --draco.compressMeshes=false');
      })
      .then(function() {
        // Establecer doubleSided a true en el archivo GLTF
        return setDoubleSided(outputFilePath);
      })
      .then(function() {
        console.log('¡Conversión de ' + file + ' completada!\n');
      })
      .catch(function(error) {
        console.error('Error procesando el archivo ' + file + ':', error);
      });
  });
});
