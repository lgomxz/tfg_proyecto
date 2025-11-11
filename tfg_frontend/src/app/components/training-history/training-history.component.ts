import { Component, OnInit } from '@angular/core';
import { ChartData, ChartOptions } from 'chart.js';
import { switchMap } from 'rxjs';
import { AuthService } from '../../services/auth.service';
import { UserApiService } from '../../services/user-api.service';
import { PubisLabelService } from '../../services/pubis-label.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { NgChartsModule } from 'ng2-charts';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-training-history',
  standalone: true,
  imports: [CommonModule, MatTableModule, NgChartsModule, TranslateModule],
  templateUrl: './training-history.component.html',
  styleUrls: ['./training-history.component.scss'],
})
export class TrainingHistoryComponent implements OnInit {
  displayedColumns: string[] = ['createdAt', 'score'];
  trainingHistory: any[] = [];

  scoreChartData: ChartData<'line'> = {
    labels: [],
    datasets: [
      {
        data: [],
        label: '',
        fill: false,
        borderColor: '#3b82f6',
        tension: 0.3,
        pointBackgroundColor: '#3b82f6',
      },
    ],
  };

  chartOptions: ChartOptions = {
    responsive: true,
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Score (%)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Date',
        },
      },
    },
  };

  constructor(
    private authService: AuthService,
    private userService: UserApiService,
    private pubisLabelService: PubisLabelService,
    private translate: TranslateService
  ) {}

  ngOnInit(): void {
    this.translate.onLangChange.subscribe(() => {
      this.setChartLabel();
    });
    this.authService
      .getUserEmail()
      .pipe(
        switchMap(email => {
          if (email) return this.userService.getUserByEmail(email);
          throw new Error('No se encontró el email del usuario');
        })
      )
      .subscribe({
        next: user => {
          if (!user?.id)
            return console.error('El usuario no tiene un ID válido.');
          this.fetchTrainingHistory(user.id);
        },
        error: err =>
          console.error('Error al obtener el email o usuario:', err),
      });
  }

  setChartLabel() {
    this.translate
      .get('CHART.SCORE_LABEL')
      .subscribe((translatedLabel: string) => {
        this.scoreChartData.datasets[0].label = translatedLabel;
      });
  }

  fetchTrainingHistory(userId: string): void {
    this.pubisLabelService
      .getTrainingHistoryByUser(userId)
      .subscribe(historyData => {
        this.trainingHistory = historyData.map(item => ({
          ...item,
          label: item.label || { name: '-' },
        }));

        this.scoreChartData = {
          labels: this.trainingHistory.map(item =>
            new Date(item.createdAt).toLocaleDateString()
          ),
          datasets: [
            {
              data: this.trainingHistory.map(item => item.score),
              label: 'Puntuación sobre etiquetas expertas',
              fill: false,
              tension: 0.3,
              pointBackgroundColor: '#2B2577',
            },
          ],
        };
      });
  }
}
