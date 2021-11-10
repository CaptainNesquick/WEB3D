import {
  DirectionalLight,
  Mesh,
  MeshPhysicalMaterial,
  TextureLoader,
  WebGLRenderer,
  UnsignedByteType, PMREMGenerator, RepeatWrapping, PlaneBufferGeometry, ShadowMaterial
} from 'three';
import { Example } from './example';
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {HDRCubeTextureLoader} from "three/examples/jsm/loaders/HDRCubeTextureLoader";

export default class TextureExample extends Example {
  controls: OrbitControls

  constructor(renderer: WebGLRenderer) {
    super(renderer);

    this.controls = new OrbitControls(this._cam, this._renderer.domElement);
  }

  public initialize() {
    super.initialize();

    this._renderer.shadowMap.enabled = true;

    const loaderTexture = new TextureLoader();
    const textureAlbedo = loaderTexture.load('assets/textures/rust/albedo.png');
    textureAlbedo.wrapS = RepeatWrapping;
    textureAlbedo.wrapT = RepeatWrapping;
    const textureNormal = loaderTexture.load('assets/textures/rust/normal.png');
    textureNormal.wrapS = RepeatWrapping;
    textureNormal.wrapT = RepeatWrapping;
    const textureMetallic = loaderTexture.load('assets/textures/rust/metallic.png');
    textureMetallic.wrapS = RepeatWrapping;
    textureMetallic.wrapT = RepeatWrapping;
    const textureRoughness = loaderTexture.load('assets/textures/rust/roughness.png');
    textureRoughness.wrapS = RepeatWrapping;
    textureRoughness.wrapT = RepeatWrapping;

    const directionalLight = new DirectionalLight(0xfdfbd3, 1);
    directionalLight.add(directionalLight.target);
    directionalLight.position.set(0, 0, 0);
    directionalLight.target.position.set(8, -8, -12);
    directionalLight.castShadow = true;

    const additionalDirectionalLight = new DirectionalLight(0xffc0cb, 1);
    additionalDirectionalLight.add(additionalDirectionalLight.target);
    additionalDirectionalLight.position.set(0, 0, 0);
    additionalDirectionalLight.target.position.set(-8, -8, 0);
    additionalDirectionalLight.castShadow = true;

    for (let i = 0; i < 5; i++) {
      for (let j = 0; j < 5; j++) {
        const meshPhysicalMaterial = new MeshPhysicalMaterial({
          map: textureAlbedo,
          normalMap: textureNormal,
          metalness: i * 0.2,
          metalnessMap: textureMetallic,
          roughness: j * 0.2,
          roughnessMap: textureRoughness
        });

        const loader = new OBJLoader();
        loader.load('assets/models/material_sphere.obj', (object) => {
              object.traverse((child) => {
                if (child instanceof Mesh) {
                  child.material = meshPhysicalMaterial;
                  child.castShadow = true;
                }
              });
              object.castShadow = true;
              object.position.set(i * 1.5 - 3, 0, j * 1.5 - 3)
              this._scene.add(object);
            },
            undefined,
            (e) => console.error(e)
        )
      }
    }

    const pmremGenerator = new PMREMGenerator(this._renderer);
    pmremGenerator.compileCubemapShader();
    const hdrTexture = new HDRCubeTextureLoader()
        .setPath('assets/env/pisa/')
        .setDataType(UnsignedByteType)
        .load(['px.hdr', 'nx.hdr', 'py.hdr', 'ny.hdr', 'pz.hdr', 'nz.hdr'], () => {
          const target = pmremGenerator.fromCubemap(hdrTexture);
          this._scene.environment = target.texture;
          this._scene.background = target.texture;
        });

    const shadowPlane = new Mesh(new PlaneBufferGeometry(15,15), new ShadowMaterial());
    shadowPlane.position.set(0,-.6,0);
    shadowPlane.rotation.x = - Math.PI / 2;
    shadowPlane.receiveShadow = true;

    this._scene.add(directionalLight, additionalDirectionalLight, shadowPlane);
    this.controls.update();
  }

  public destroy(): void {
    super.destroy();
    // @todo
  }

  public update(): void {
    // @todo
  }

}
