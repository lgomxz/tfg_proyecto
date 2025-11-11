import { Component } from '@angular/core';
import { PubisViewerComponent } from '../../components/pubis-viewer/pubis-viewer.component';


@Component({
  selector: 'app-training-tool',
  standalone: true,
  imports: [
    PubisViewerComponent
  ],
  templateUrl: './training-tool.component.html',
  styleUrl: './training-tool.component.scss'
})
export class TrainingToolComponent {

}
