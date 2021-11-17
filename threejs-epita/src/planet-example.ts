import {
  CircleGeometry,
  Color, LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  MeshLambertMaterial, OctahedronGeometry, PerspectiveCamera,
  PointLight, TorusBufferGeometry,
  WebGLRenderer
} from 'three';

import { Example } from './example';
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";

export default class PlanetsExample extends Example {

  public earthMesh?;
  public marsMesh?;

  constructor(renderer: WebGLRenderer) {
    super(renderer);

    this.earthMesh = new OctahedronGeometry(0.05, 1);
    this.marsMesh = new OctahedronGeometry(0.03, 4);
  }

  public initialize(): void {
    super.initialize();

    const cam = new PerspectiveCamera();
    const renderer = new WebGLRenderer();
    const controls = new OrbitControls(cam, renderer.domElement);

    renderer.setAnimationLoop(() => {
      controls.update();
    });

    this._scene.background = new Color('#020202');

    const sun = new Mesh(new CircleGeometry(0.15, 32), new MeshBasicMaterial());
    sun.material.color.set('#FFFF00');
    sun.scale.set(0.5, 0.5, 0.5);
    this._scene.add(sun);

    const sunLight = new PointLight('#FFFFFF', 10, 0);
    sunLight.decay = 0;
    sunLight.position.set(0,0,0);
    this._scene.add(sunLight);

    const mars = new Mesh(this.marsMesh, new MeshLambertMaterial());
    mars.material.color.set('#9B7653');
    mars.position.set(1, 0, 0);
    this._scene.add(mars);

    const marsOrbit = new Mesh(new TorusBufferGeometry(1, 0.005, 30, 128), new LineBasicMaterial());
    marsOrbit.material.color.set('#202020');
    this._scene.add(marsOrbit);

    const earth = new Mesh(this.earthMesh, new MeshLambertMaterial());
    earth.material.color.set('#0020FF');
    earth.position.set(0.8, 0.3, 0);
    this._scene.add(earth);

    const earthOrbit = new Mesh(new TorusBufferGeometry(0.855, 0.005, 30, 128), new LineBasicMaterial());
    earthOrbit.material.color.set('#202020');
    this._scene.add(earthOrbit);
  }

  public destroy(): void {
    super.destroy();
    if (this.earthMesh) {
      this.earthMesh.dispose();
    }

    if (this.marsMesh) {
      this.marsMesh.dispose();
    }
  }

  public update(delta: number, _: number): void {
    this._scene.rotateZ(0.01);

    if (this.earthMesh) {
      this.earthMesh.rotateZ(0.01);
    }

    if (this.marsMesh) {
      this.marsMesh.rotateZ(0.01027);
    }
  }

}