export interface Subject {
  id?: string; // ID único del sujeto
  shortId?: string; 
  name: string; // Nombre del sujeto
  lastname: string; // Apellido del sujeto
  sex: string; // Sexo del sujeto (puede ser 'male' o 'female')
  biological_age_at_death?: number; // Edad al fallecer
  body_build: string; // Complexión del sujeto
  preliminary_proceedings: string; // Procedimientos preliminares
  acquisition_year: Date | null; 
  judged: string; // Evaluación judicial
  death_cause: string; // Causa de muerte
  toxicological_report: string; // Informe toxicológico  
}