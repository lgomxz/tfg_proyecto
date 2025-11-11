import { DataSource } from 'typeorm';
import { config } from 'dotenv';
config();

const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT, // El puerto se convierte en número
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: false,
  entities: ['src/entities/*.ts'], // Asegúrate de que sea la ruta correcta
  migrations: ['src/migrations/*.ts'],
  migrationsRun: false,
  logging: true,
});

export default AppDataSource;
