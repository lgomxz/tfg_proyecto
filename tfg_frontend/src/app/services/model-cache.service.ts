import * as THREE from 'three';
import { Injectable } from '@angular/core';

export interface CachedModelData {
  model: THREE.Object3D;
  cameraPosition: THREE.Vector3;
  controlsTarget: THREE.Vector3;
}

@Injectable({ providedIn: 'root' })

export class ModelCacheService {
  private cache = new Map<string, CachedModelData>();

  getModelData(url: string): CachedModelData | undefined {
    return this.cache.get(url);
  }

  setModelData(url: string, data: CachedModelData): void {
    this.cache.set(url, data);
  }
}
