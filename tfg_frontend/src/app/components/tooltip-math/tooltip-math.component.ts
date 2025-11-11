import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  Renderer2,
  ViewChild,
} from '@angular/core';

declare const MathJax: any;

@Component({
  selector: 'app-tooltip-math',
  templateUrl: './tooltip-math.component.html',
  styleUrls: ['./tooltip-math.component.scss'],
  standalone: true,
})
export class MathjaxTooltipComponent implements AfterViewInit {
  @ViewChild('tooltipContainer') container!: ElementRef;
  @Input() formula: string = '';

  constructor(private renderer: Renderer2) {}

  ngAfterViewInit() {
    MathJax.typesetPromise([this.container.nativeElement]).then(() => {
      // Añadimos la clase 'show' después de que MathJax renderice
      this.renderer.addClass(this.container.nativeElement, 'show');
    });
  }
}
