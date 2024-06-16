import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { scene } from './world.js';

import { BloodShader } from './shaders/blood_shader.js';

let composer;
let bloodShader;
export function initShaders(renderer, camera) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloodShader = new ShaderPass(BloodShader)
    composer.addPass(bloodShader);
    composer.addPass(new OutputPass());
}

/**
 * Render the shader
 */
export function renderShaders() {
    bloodShader.uniforms.health.value = health;
    composer.render();
}