/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { Chart, registerables } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
// Registra todos los componentes de Chart.js y el plugin ChartDataLabels
Chart.register(...registerables);
Chart.register(ChartDataLabels);

bootstrapApplication(AppComponent, appConfig)
  .catch(err => console.error(err));
