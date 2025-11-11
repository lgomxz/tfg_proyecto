# 🧬 Herramienta software para la gestión de colecciones de sínfisis del pubis, el etiquetado de sus características y la estimación de edad a partir de las mismas

## 📖 Descripción

La **antropología forense** aplica los conocimientos de la antropología física a contextos legales, permitiendo identificar tanto a personas vivas como fallecidas.  
Una de las etapas más importantes en este ámbito es la **estimación del perfil biológico**, donde se determinan parámetros como la edad, el sexo, la estatura y el origen de los restos humanos.

Entre los métodos más utilizados para la **estimación de la edad** destaca el análisis de la **sínfisis del pubis**, un hueso de la pelvis que experimenta transformaciones morfológicas a lo largo de la vida.  
Dichos cambios se han documentado y empleado como indicadores de edad, pero el proceso de observación y etiquetado sigue siendo **lento y minucioso**, requiriendo una gran experiencia y precisión por parte del antropólogo.

Este proyecto propone una **aplicación web interactiva** que agiliza dicho proceso mediante herramientas digitales de etiquetado, análisis automatizado con **inteligencia artificial (IA)** y recursos de apoyo para la **formación de estudiantes y profesionales** en antropología forense.

---

## 🎯 Motivación

Esta aplicación surge como respuesta a las dificultades que enfrentan los especialistas y estudiantes en el análisis de la sínfisis del pubis.  
El objetivo principal es **aliviar la carga de trabajo** sin comprometer la precisión de los resultados, proporcionando una herramienta moderna, intuitiva y accesible.

---

## 🧠 Objetivos

1. **Desarrollar una herramienta interactiva de etiquetado y análisis**  
   Permitir a los usuarios visualizar imágenes y modelos 3D de la sínfisis del pubis y etiquetar características morfológicas según criterios predefinidos en un atlas experto.  
   Además, gestionar distintos tipos de usuario (experto, intermedio, novel, administrador) con permisos específicos.

2. **Crear un sistema de entrenamiento para usuarios noveles**  
   Incluir una sección tipo *quiz* donde los estudiantes puedan practicar el etiquetado comparando sus resultados con los de profesionales y recibiendo retroalimentación inmediata.

3. **Integrar análisis automatizado mediante IA**  
   Incorporar un módulo que ejecute estimaciones automáticas de edad basadas en las etiquetas registradas, permitiendo comparar resultados humanos y automáticos.

4. **Diseñar un área de experimentos comparativos**  
   Implementar un entorno para realizar experimentos y estudios, como comparaciones entre etiquetadores o entre muestras masculinas y femeninas, mostrando resultados estadísticos.

5. **Garantizar una interfaz intuitiva y accesible**  
   Diseñar la aplicación con un enfoque *user-friendly*, adaptado a diferentes niveles de competencia tecnológica y cumpliendo las normas de accesibilidad y protección de datos de la Universidad de Granada.

6. **Soporte multilingüe (internacionalización)**  
   Permitir el uso de la aplicación en español e inglés, con posibilidad de añadir más idiomas en el futuro.


---

## 🧩 Tecnologías Utilizadas

| Categoría | Tecnologías |
|------------|-------------|
| **Frontend** | [Angular](https://angular.io/), [Three.js](https://threejs.org/), PrimeNG, ngx-translate |
| **Backend / API** | Node.js (Express) |
| **Base de Datos** | MySQL (gestionada con [HeidiSQL](https://www.heidisql.com/)) |
| **Metodología** | Scrum |

---

## ⚙️ Instalación y Ejecución

### 1️⃣ Clonar el repositorio
```bash
git clone https://github.com/lgomxz/tfg_proyecto.git
```
### 2️⃣ Configurar la Base de Datos

> ⚠️ **Importante:** Por motivos de **confidencialidad y protección de datos**, **no se incluyen imágenes, modelos 3D ni datos reales de muestras antropológicas** en el repositorio.  
> Se proporciona únicamente la estructura del **código fuente de la API y la aplicación**, así como un esquema de base de datos vacío o de ejemplo.

1. Crear una base de datos local en MySQL (por ejemplo `tfg_3`) usando HeidiSQL o cualquier cliente.
2. Configurar las credenciales en el archivo `.env` para el backend:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
DB_DATABASE=nombre_de_tu_base
```

### Instalar las dependencias de cada proyecto

```bash
npm install
```

### Levantar el backend en modo desarrollo

```bash
npm run start:dev
``` 
### Levantar el frontend

```bash
npm run start

```

### ⚠️ Aviso de Seguridad y Protección de Datos

Por motivos de **seguridad, confidencialidad y protección de datos personales**, este repositorio **no incluye**:

- Datos reales de personas.
- Imágenes o fotografías de muestras.
- Modelos 3D de ningún tipo.
- Información sensible de cualquier índole.

Se proporciona únicamente:

- La **estructura del código fuente** del backend y frontend.
- **Esquemas de base de datos de ejemplo o vacíos**.
- Documentación