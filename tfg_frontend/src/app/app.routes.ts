import { LoginComponent } from './pages/login/login.component';
import { LabellingComponent } from './pages/labelling/labelling.component';
import { MainPageComponent } from './pages/main/main.component';
import { SupportComponent } from './pages/support/support.component';
import { PubisComponent } from './pages/pubis/pubis.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { DocumentationComponent } from './pages/documentation/documentation.component';
import { LegalContentComponent } from './pages/legal-content/legal-content.component';
import { RegisterComponent } from './pages/register/register.component';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password.component';
import { UsersCenterComponent } from './pages/users-center/users-center.component';
import { PubisDataComponent } from './pages/pubis-data/pubis-data.component';
import { Routes } from '@angular/router';
import { ResetPasswordComponent } from './pages/reset-passwd/reset-passwd.component';
import { TrainingToolComponent } from './pages/training-tool/training-tool.component';
import { AuthGuard } from './auth/authguard.guard';
import { TrainingHistoryComponent } from './components/training-history/training-history.component';
import { SingleSampleComponent } from './pages/single-sample/single-sample.component';
import { MultipleSamplesComponent } from './pages/multiple-samples/multiple-samples.component';
import { ExperimentsComponent } from './pages/experiments/experiments.component';

export const routes: Routes = [
  {
    path: 'login',
    pathMatch: 'full',
    component: LoginComponent,
  },
  {
    path: '',
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        component: MainPageComponent,
      },
      {
        path: 'pubis',
        component: PubisComponent,
        children: [
          {
            path: 'labelling',
            component: LabellingComponent,
          },
        ],
      },
    ],
  },
  {
    path: 'pubis-data',
    canActivate: [AuthGuard],
    pathMatch: 'full',
    component: PubisDataComponent,
  },
  {
    path: 'training-history',
    canActivate: [AuthGuard],
    pathMatch: 'full',
    component: TrainingHistoryComponent,
  },
  {
    path: 'estimate-ai/single-sample',
    canActivate: [AuthGuard],
    pathMatch: 'full',
    component: SingleSampleComponent,
  },
  {
    path: 'estimate-ai/multiple-samples',
    canActivate: [AuthGuard],
    pathMatch: 'full',
    component: MultipleSamplesComponent,
  },
  {
    path: 'users-center',
    canActivate: [AuthGuard],
    pathMatch: 'full',
    component: UsersCenterComponent,
  },
  {
    path: 'support',
    canActivate: [AuthGuard],
    pathMatch: 'full',
    component: SupportComponent,
  },
  {
    path: 'training-tool',
    canActivate: [AuthGuard],
    pathMatch: 'full',
    component: TrainingToolComponent,
  },
  {
    path: 'legal/:type',
    canActivate: [AuthGuard],
    component: LegalContentComponent,
  },
  {
    path: 'register',
    pathMatch: 'full',
    component: RegisterComponent,
  },
  {
    path: 'forgot-password',
    pathMatch: 'full',
    component: ForgotPasswordComponent,
  },
  {
    path: 'experiments',
    canActivate: [AuthGuard],
    pathMatch: 'full',
    component: ExperimentsComponent,
  },
  {
    path: 'reset/:token',
    pathMatch: 'full',
    component: ResetPasswordComponent,
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    pathMatch: 'full',
    component: ProfileComponent,
  },
  {
    path: 'documentation',
    canActivate: [AuthGuard],
    pathMatch: 'full',
    component: DocumentationComponent,
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
