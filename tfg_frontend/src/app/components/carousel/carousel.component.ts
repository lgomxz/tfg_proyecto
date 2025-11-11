import {
  Component,
  Input,
  OnInit,
  SimpleChanges,
  OnChanges,
  ChangeDetectorRef,
} from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
import { MyFile } from '../../models/file';

@Component({
  selector: 'app-carousel',
  standalone: true,
  imports: [CarouselModule],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit, OnChanges {
  @Input() bones!: MyFile[];

  activeIndex: number = 0;
  bones_img!: MyFile[];

  constructor(private changeDetectorRef: ChangeDetectorRef) {}

  // Variables para el drag
  isDragging = false;
  startX = 0;
  startY = 0;
  offsetX = 0;
  offsetY = 0;
  scale = 1; // Variable para el control del zoom

  ngOnInit() {
    this.formatBones();

    // Escucha eventos globales de mouseup para terminar el drag
    document.addEventListener('mouseup', () => {
      this.isDragging = false;
    });
  }

  // Formatea los datos recibidos en "bones" para adaptarlos
  private formatBones() {
    if (this.bones) {
      this.bones_img = this.bones.map(bone => ({
        id: bone.id,
        name: bone.name,
        img: bone.link,
      }));
    }
  }

  // Detecta cambios en los inputs del componente
  ngOnChanges(changes: SimpleChanges) {
    if (changes['bones']) {
      this.changeDetectorRef.detectChanges();
    }
  }

  // Evento para el cambio de página en el carrusel
  onPage(event: any) {
    this.activeIndex = event.page;
  }

  // Manejo del zoom con la rueda del ratón
  onZoom(event: WheelEvent) {
    const image = event.target as HTMLImageElement;
    const container = image.closest('.zoom-container') as HTMLElement;
    const newScale = this.scale + (event.deltaY < 0 ? 0.1 : -0.1);
    event.preventDefault(); // Evita que el scroll afecte a la página

    // Si el zoom baja de 1, reseteamos posición y estilo

    if (newScale < 1) {
      this.scale = 1;
      this.offsetX = 0;
      this.offsetY = 0;
      image.style.transform = '';
      image.classList.remove('zoomed', 'grabbing');
      return;
    }

    // Limitación del zoom
    if (newScale > 5) return;

    this.scale = newScale;

    // Cálculo de límites de desplazamiento para que la imagen no se salga del contenedor
    const imageWidth = image.naturalWidth * this.scale;
    const imageHeight = image.naturalHeight * this.scale;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const maxOffsetX = (imageWidth - containerWidth) / 2;
    const maxOffsetY = (imageHeight - containerHeight) / 2;

    this.offsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, this.offsetX));
    this.offsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, this.offsetY));

    image.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;

    if (this.scale > 1) {
      image.classList.add('zoomed');
    } else {
      image.classList.remove('zoomed');
    }
  }

  // Inicia el arrastre de la imagen cuando el usuario hace clic y mantiene presionado
  onMouseDown(event: MouseEvent) {
    if (this.scale > 1) {
      this.isDragging = true;
      this.startX = event.clientX - this.offsetX;
      this.startY = event.clientY - this.offsetY;

      const image = event.target as HTMLImageElement;
      image.classList.add('grabbing');

      event.preventDefault();
    }
  }

  // Actualiza la posición de la imagen según el movimiento
  onMouseMove(event: MouseEvent) {
    if (!this.isDragging || this.scale <= 1) return;

    const image = event.target as HTMLImageElement;
    const container = image.closest('.zoom-container') as HTMLElement;

    const deltaX = event.movementX;
    const deltaY = event.movementY;

    this.offsetX += deltaX;
    this.offsetY += deltaY;

    // Cálculo de límites de moviemiento según el tamaño de la imagen y el contenedor
    const imageWidth = image.naturalWidth * this.scale;
    const imageHeight = image.naturalHeight * this.scale;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    const maxOffsetX = (imageWidth - containerWidth) / 2;
    const maxOffsetY = (imageHeight - containerHeight) / 2;

    this.offsetX = Math.min(maxOffsetX, Math.max(-maxOffsetX, this.offsetX));
    this.offsetY = Math.min(maxOffsetY, Math.max(-maxOffsetY, this.offsetY));

    image.style.transform = `translate(${this.offsetX}px, ${this.offsetY}px) scale(${this.scale})`;
  }

  // Termina el drag
  // Restaura el cursor
  onMouseUp(event: MouseEvent) {
    this.isDragging = false;
    const image = event.target as HTMLImageElement;
    image.classList.remove('grabbing');
  }
}
