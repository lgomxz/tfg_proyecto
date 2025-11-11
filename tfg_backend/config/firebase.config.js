import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// Se cargan las variables de entorno
dotenv.config();

// Se construye la ruta al archivo de credenciales de firebase
const serviceAccountPath = path.join(__dirname, '../../config/firebase-service-account.json');
let serviceAccount;

try {
    // Se parsea el archivo de credenciales
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
}
catch (error) {
    throw new Error('No se pudo cargar las credenciales de Firebase.');
}
try {
    // Se inicializa la app de Firebase Admin indicando credenciales y bucket donde trabajar
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.STORAGE_BUCKET,
    });
}
catch (error) {
    throw new Error('No se pudo inicializar Firebase Admin.');
}

// Se exporta el bucket para usarlo en otros módulos
export const bucket = admin.storage().bucket();