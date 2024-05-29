import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GlitchPass } from 'three/addons/postprocessing/GlitchPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

const glitchPass = new GlitchPass();
composer.addPass(glitchPass);

const outputPass = new OutputPass();
composer.addPass(outputPass);

/**
 * Render the shader
 */
function renderScene() {
    composer.render();
}

module.exports = {
    id: 'shader',
    renderScene
};