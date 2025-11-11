import * as fs from 'fs/promises';
import * as fssync from 'fs';
import * as path from 'path';
import { spawn } from 'child_process';
import { v4 as uuidv4 } from 'uuid';

export async function generateArffPrediction(
  data: Record<string, string> | Record<string, string>[],
): Promise<string | string[]> {
  console.time('TOTAL');

  const isArray = Array.isArray(data);
  const samples = isArray ? data : [data];

  // Se crea un ID único para esta ejecución (para aislar archivos temporales)
  const jobId = uuidv4();
  const baseDir = path.join(
    process.cwd(),
    'src',
    'utils',
    'pubicAgeEstimator',
    'temp',
    jobId,
  );
  const datasetDir = path.join(baseDir, 'dataset');
  const outputDir = path.join(baseDir, 'output');

  // Crea directorios temporales donde se guardarán los archivos ARFF, resultados, etc.
  console.time('Crear directorios');
  await fs.mkdir(datasetDir, { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
  console.timeEnd('Crear directorios');

  // Rutas base y nombre de archivo ARFF
  const pubicDir = path.join(
    process.cwd(),
    'src',
    'utils',
    'pubicAgeEstimator',
  );

  // Generar el archivo ARFF (formato usado por WEKA/KEEL para datasets)
  const arffFileName = `sample_${jobId}.arff`;
  const arffPath = path.join(datasetDir, arffFileName);

  console.time(' Generar archivo ARFF');
  const header = `
@relation JaviCompleto

@attribute ArticularFace {RegularPorosity,RidgesAndGrooves,GroovesShallow,GroovesRest,NoGrooves}
@attribute IrregularPorosity {Absence,Medium,Much}
@attribute UpperSymphysialExtremity {NotDefined,Defined}
@attribute BonyNodule {Absent,Present}
@attribute LowerSymphysialExtremity {NotDefined,Defined}
@attribute DorsalMargin {Absent,Present,Closed}
@attribute DorsalPlaeau {Absent,Present}
@attribute VentralBevel {Absent,InProcess,Present}
@attribute VentralMargin {Absent,PartiallyFormed,FormedWithoutRarefactions,FormedWitFewRarefactions,FormedWithLotRecessesAndProtrusions}
@attribute ToddPhase {Ph01-19,Ph02-20-21,Ph03-22-24,Ph04-25-26,Ph05-27-30,Ph06-31-34,Ph07-35-39,Ph08-40-44,Ph09-45-49,Ph10-50-}

@data`.trim();

  const rows = samples
    .map((s) =>
      [
        s.ArticularFace,
        s.IrregularPorosity,
        s.UpperSymphysialExtremity,
        s.BonyNodule,
        s.LowerSymphysialExtremity,
        s.DorsalMargin,
        s.DorsalPlateau,
        s.VentralBevel,
        s.VentralMargin,
        s.ToddPhase,
      ].join(','),
    )
    .join('\n');

  // Se escribe el archivo ARFF completo (encabezado + datos)
  await fs.writeFile(arffPath, `${header}\n${rows}`);
  console.timeEnd('Generar archivo ARFF');

  console.time('Preparar archivo de configuración');
  const configTemplatePath = path.join(pubicDir, 'configKeel.txt');
  let config = await fs.readFile(configTemplatePath, 'utf8');

  // Se reemplazan las rutas de entrada y salida con las generadas dinámicamente
  config = config.replace(
    /inputData\s*=.*\n/,
    `inputData = "dataset/javiTrain.arff" "NoUsado" "temp/${jobId}/dataset/${arffFileName}"\n`,
  );
  config = config.replace(
    /outputData\s*=.*\n/,
    `outputData = "output/javiTrain.tra.result" "temp/${jobId}/output/${jobId}.tst.result" "temp/${jobId}/output/${jobId}.txt"\n`,
  );

  const configPath = path.join(baseDir, `configKeel_${jobId}.txt`);
  await fs.writeFile(configPath, config);
  console.timeEnd('Preparar archivo de configuración');

  // Se ejecuta el modelo en Java usando el archivo de configuración generado
  console.time('Ejecutar Java directamente');
  const javaCmd = 'java';
  const jarPath = path.join(pubicDir, 'NSLVOrdCostMatrixWithInfMeasures.jar');

  await new Promise<void>((resolve, reject) => {
    const subprocess = spawn(javaCmd, ['-jar', jarPath, configPath], {
      cwd: pubicDir,
      env: process.env,
      stdio: 'ignore', // ignoramos salida para no ralentizar
    });

    // Timeout para evitar bloqueos (15 segundos)
    const timeoutMs = 15000;
    const timer = setTimeout(() => {
      subprocess.kill();
      reject(new Error('Timeout ejecutando Java'));
    }, timeoutMs);

    subprocess.on('close', (code) => {
      clearTimeout(timer);
      code === 0
        ? resolve()
        : reject(new Error(`Java terminó con código ${code}`));
    });
  });
  console.timeEnd('Ejecutar Java ');

  // Lee las predicciones generadas
  console.time('Leer predicciones');
  const resultPath = path.join(baseDir, `output/${jobId}.tst.result`);
  if (!fssync.existsSync(resultPath)) {
    throw new Error(`Archivo resultado no encontrado: ${resultPath}`);
  }

  const content = await fs.readFile(resultPath, 'utf8');
  const lines = content.trim().split('\n');
  const dataIndex = lines.findIndex((l) => l.trim().toLowerCase() === '@data');
  if (dataIndex === -1 || dataIndex === lines.length - 1) {
    throw new Error(
      'Sección @data no encontrada o inválida en archivo de resultado',
    );
  }

  // Extrae las líneas de datos después de la etiqueta @data
  const predictionLines = lines.slice(dataIndex + 1);
  const predictions = predictionLines.map((line) => {
    const parts = line.trim().split(/\s+/);
    return parts[1] || null;
  });
  console.timeEnd('Leer predicciones');

  // Si el input fue un array, devuelve todas las predicciones, si no, una sola
  const result = isArray ? predictions : predictions[0];

  // Limpieza en segundo plano (no await)
  fs.rm(baseDir, { recursive: true, force: true })
    .then(() =>
      console.log(`Archivos temporales eliminados para jobId ${jobId}`),
    )
    .catch((err) => console.error('Error eliminando temporales:', err));

  console.timeEnd('TOTAL');

  return result;
}

//  Estima una edad numérica aproximada a partir de las etiquetas de un pubis
export function estimateAgeFromLabel(label: any): number | null {
  // Diccionario que mapea valores categóricos a valores numéricos
  const valueMappings = {
    irregularPorosity: { Absence: 1, Medium: 2, Much: 3 },
    upperSymphysial: { NotDefined: 1, Defined: 2 },
    lowerSymphysial: { NotDefined: 1, Defined: 2 },
    ventralBevel: { Absent: 1, InProcess: 2, Present: 3 },
    ventralMargin: {
      Absent: 1,
      PartiallyFormed: 2,
      FormedWithoutRarefactions: 3,
      FormedWitFewRarefactions: 4,
      FormedWithLotRecessesAndProtrusions: 5,
    },
  };

  // Conversión de las etiquetas del pubis a valores numéricos
  const ip =
    valueMappings.irregularPorosity[label.auricular_face_irregular_pososity];
  const us =
    valueMappings.upperSymphysial[label.upper_symphyseal_extremity_definition];
  const ls =
    valueMappings.lowerSymphysial[label.lower_symphyseal_extremity_definition];
  const vb = valueMappings.ventralBevel[label.ventral_margin_ventral_bevel];
  const vm = valueMappings.ventralMargin[label.ventral_margin_ventral_margin];

  if ([ip, us, ls, vb, vm].some((v) => v === undefined)) {
    console.warn(
      'Faltan valores requeridos o son inválidos para calcular edad.',
    );
    return null; // Si falta algún valor o es inválido
  }

  // Fórmula empírica para estimar la edad
  const age = 6.06 * ip + us + 6.06 * ls + 5.06 * vm + vb / ip;

  // Redondea a 2 decimales y devuelve
  return Number(age.toFixed(2));
}
