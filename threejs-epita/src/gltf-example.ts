import {
  AnimationMixer,
  Clock,
  Color,
  DirectionalLight,
  DirectionalLightHelper,
  sRGBEncoding,
  WebGLRenderer
} from 'three';
import { Example } from './example';
import {DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader";
import {GLTFLoader} from "three/examples/jsm/loaders/GLTFLoader";
import {OrbitControls} from "three/examples/jsm/controls/OrbitControls";
import {EffectComposer} from "three/examples/jsm/postprocessing/EffectComposer";
import {RenderPass} from "three/examples/jsm/postprocessing/RenderPass";
import {BokehPass} from "three/examples/jsm/postprocessing/BokehPass";

interface MyUniform {
  value: any;
}

interface MyUniforms {
  focus: MyUniform,
  maxblur: MyUniform,
  aperture: MyUniform
}

export default class GLTFExample extends Example {
  controls: OrbitControls
  mixer?: AnimationMixer
  clock?: Clock
  dofPass?: BokehPass
  width = 100
  height = 60
  composer?: EffectComposer
  light1?: DirectionalLight
  light2?: DirectionalLight
  time = 0

  speed = {speed: 1}
  focus = {focus: 0}
  aperture = {aperture: 0}
  maxblur = {maxblur: 0}
  lightColor1 = {lightColor: 0xd7d3fd}
  lightIntensity2 = {lightIntensity2: 1}
  lightColor2 = {lightColor: 0xf3c0ff}

  constructor(renderer: WebGLRenderer) {
    super(renderer);

    this.controls = new OrbitControls(this._cam, this._renderer.domElement);
  }

  public initialize() {
    super.initialize();

    this.light1 = new DirectionalLight(this.lightColor1.lightColor, 0);
    this.light1.add(this.light1.target);
    this.light1.position.set(0, 0, 0);
    this.light1.target.position.set(8, -8, -12);
    this.light1.castShadow = true;

    this.light2 = new DirectionalLight(this.lightColor2.lightColor, this.lightIntensity2.lightIntensity2);
    this.light2.add(this.light2.target);
    this.light2.position.set(0, 0, 0);
    this.light2.target.position.set(-0, -8, 12);
    this.light2.castShadow = true;

    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('./lib/draco/')
    const gltfLoader = new GLTFLoader();

    gltfLoader.setDRACOLoader(dracoLoader);

    this.clock = new Clock();


    const folder = this._gui.addFolder('Animation Values')
    folder.add(this.speed, 'speed', 0, 10, 0.1)
    folder.add(this.focus, 'focus', 0, 1000, 0.01)
    folder.add(this.aperture, 'aperture', 0, 0.005, 0.001)
    folder.add(this.maxblur, 'maxblur', 0, 0.01, 0.001)
    folder.addColor(this.lightColor1, 'lightColor')
    folder.add(this.lightIntensity2, 'lightIntensity2', 0, 1, 0.1)
    folder.addColor(this.lightColor2, 'lightColor')

    const glbPath = 'assets/models/LittlestTokyo.glb\n';
    gltfLoader.load(glbPath, (gltf) => {
      console.log(gltf)

      const model = gltf.scene;
      model.position.set( 1, 1, 0 );
      model.scale.set( 0.01, 0.01, 0.01 );
      this._scene.add( model );

      this.mixer = new AnimationMixer( model );
      this.mixer.clipAction( gltf.animations[0] ).play();
    });

    this.dofPass = new BokehPass(this._scene, this._cam, {
      focus: 0,
      aperture: 0,
      maxblur: 0
    })

    this.composer = new EffectComposer(this._renderer)
    const renderPass = new RenderPass(this._scene, this._cam)
    this.dofPass?.renderTargetDepth.setSize(this.width, this.height)

    this.composer.addPass(renderPass)
    this.composer.addPass(this.dofPass)

    this._scene.add(this.light1, this.light2);
  }

  public destroy(): void {
    super.destroy();
    // @todo
  }

  public render() {
    this.composer?.render()
  }

  public update(): void {

    const delta = this.clock?.getDelta();
    this.time = (this.time + (delta ?? 0)) % 20
    this.mixer?.update((delta ?? 0) * this.speed.speed);

    const bokehUniforms = this.dofPass?.uniforms as MyUniforms

    bokehUniforms[ 'focus' ].value = this.focus.focus
    bokehUniforms[ 'maxblur' ].value = this.maxblur.maxblur
    bokehUniforms[ 'aperture' ].value = this.aperture.aperture

    if (this.light1 != null)
    {
      const mult = this.time < 10 ? this.time / 10 : (20 - this.time) / 10
      this.light1.intensity = mult
      this.light1.color = new Color(this.lightColor1.lightColor)
    }

    if (this.light2 != null)
    {
      this.light2.intensity = this.lightIntensity2.lightIntensity2
      this.light2.color = new Color(this.lightColor2.lightColor)
    }

    this.controls.update();
  }

  public resize(w: number, h: number) {
    super.resize(w, h)

    this.dofPass?.renderTargetDepth.setSize(w, h)
    this.composer?.setSize(w, h)
  }
}
