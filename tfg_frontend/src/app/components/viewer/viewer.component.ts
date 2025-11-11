import { Component, OnDestroy, AfterViewInit, ElementRef, ViewChild, Input, ChangeDetectorRef } from '@angular/core';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { CommonModule } from '@angular/common';
import { MyFile } from '../../models/file';
import { ModelCacheService } from '../../services/model-cache.service';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-viewer',
  templateUrl: './viewer.component.html',
  styleUrls: ['./viewer.component.scss']
})
export class ViewerComponent implements OnDestroy, AfterViewInit {
  @ViewChild('container', { static: true }) container!: ElementRef;
  @Input() modelURL: MyFile = { link: '' };

  private renderer!: THREE.WebGLRenderer;
  private scene!: THREE.Scene;
  private camera!: THREE.PerspectiveCamera;
  private controls!: OrbitControls;
  private animationFrameId!: number;
  private model?: THREE.Object3D ;
  public modelLoaded = false;

  
  constructor(private cdRef: ChangeDetectorRef,private cacheService: ModelCacheService) {
  }

  ngAfterViewInit(): void {
    this.initThreeJS();
    this.animate();
    this.loadModel();
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    cancelAnimationFrame(this.animationFrameId);
  }

  private initThreeJS(): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xffffff);

    this.camera = new THREE.PerspectiveCamera(75, this.getAspectRatio(), 0.1, 1000);
    this.camera.position.set(0, 0, 10); // Ajustar posición inicial de la cámara

    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(this.container.nativeElement.clientWidth, this.container.nativeElement.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.nativeElement.appendChild(this.renderer.domElement);

    // Configuración de OrbitControls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true; // Suaviza el movimiento
    this.controls.dampingFactor = 0.1; // Ajuste de suavidad de rotación
    this.controls.rotateSpeed = 0.8;
    this.controls.zoomSpeed = 0.9;
    this.controls.panSpeed = 0.5; // Velocidad de desplazamiento (pan)
    this.controls.minDistance = 2; // Zoom mínimo
    this.controls.maxDistance = 60; // Zoom máximo
    this.controls.minPolarAngle = Math.PI / 6; // Limitar inclinación de la cámara hacia arriba
    this.controls.maxPolarAngle = Math.PI / 1.5; // Limitar inclinación de la cámara hacia abajo

    // Asignar botones de control
    this.controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,   // Botón izquierdo para rotar
      RIGHT: THREE.MOUSE.PAN,     // Botón derecho para mover (pan)
      MIDDLE: THREE.MOUSE.DOLLY   // Botón central (scroll) para zoom
    };

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2.5);
    directionalLight.position.set(10, 10, 10).normalize();
    this.scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight2.position.set(-10, -10, -10).normalize();  // Luz adicional
    this.scene.add(directionalLight2);

    window.addEventListener('resize', this.onWindowResize.bind(this));
  }

  private loadModel(): void {
    this.modelLoaded = false;
    this.cdRef.detectChanges(); 

    const cachedData = this.cacheService.getModelData(this.modelURL.link!);
    if (cachedData) {
      const clone = cachedData.model.clone();

      // Restaurar posición y target guardados
      this.camera.position.copy(cachedData.cameraPosition);
      this.controls.target.copy(cachedData.controlsTarget);
      this.controls.update();

      // Más visual
       setTimeout(() => {
        this.scene.add(clone);
        this.model = clone;
        this.modelLoaded = true;
        this.cdRef.detectChanges();
      }, 100);
      return;
    }

    const loader = new GLTFLoader();
    loader.load(
      this.modelURL.link!,
      (gltf) => {
        const object = gltf.scene;

        const box = new THREE.Box3().setFromObject(object);
        const center = box.getCenter(new THREE.Vector3());
        object.position.sub(center);

        this.scene.add(object);
        this.model = object;

        const size = box.getSize(new THREE.Vector3()).length();
        this.camera.position.set(0, 0, size * 1.5);
        this.controls.target.copy(center);
        this.controls.update();

        // Guardar en caché la info completa
        this.cacheService.setModelData(this.modelURL.link!, {
          model: object.clone(),
          cameraPosition: this.camera.position.clone(),
          controlsTarget: this.controls.target.clone(),
        });

        this.modelLoaded = true;
        this.cdRef.detectChanges();
      },
      (xhr) => console.log((xhr.loaded / xhr.total) * 100 + '% loaded'),
      (error) => console.error('Error loading model', error)
    );
  }


  private animate = (): void => {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  };

  private onWindowResize(): void {
    const width = this.container.nativeElement.clientWidth;
    const height = this.container.nativeElement.clientHeight;
    this.renderer.setSize(width, height);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  private getAspectRatio(): number {
    return this.container.nativeElement.clientWidth / this.container.nativeElement.clientHeight;
  }
}
