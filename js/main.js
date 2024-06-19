import '../css/style.css'
import * as THREE from 'three';
import Stats from 'stats.js';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import * as settings from './settings.js';
import * as world from './world.js';
import * as shader from './shader.js';

let stats, camera, renderer, controls, raycaster, keys = {};

/**
 * Initialize the game (Scene, Camera, Renderer, etc)
 */
function init() {
    /* Set up the scene */
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.setZ(30);

    /* Set up the renderer */
    renderer = new THREE.WebGLRenderer();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.VSMShadowMap;
    document.body.appendChild(renderer.domElement);

    /* Stats (debug) */
    stats = new Stats();

    /* Pointer lock controls (Camera mouse control) */
    controls = new PointerLockControls(camera, document.body);

    /* Raycaster (Mouse picking) */
    raycaster = new THREE.Raycaster();

    world.createScene(camera);
    shader.initShaders(renderer, camera);
    renderScene();
}

/**
 * Main Game loop
 */
function renderScene() {
    stats.begin(); // Begin performance tracking
    requestAnimationFrame(renderScene); // Request next frame
    
    if(!isMenuOpen()) {// Pause the game if the menu is open
        handleMovement(); // Handle player movement
        world.handleWorld(); // Handle world entities
    } else 
        settings.saveSettings(); // Save settings if the menu is open

    /* Rendering (scene, post-process shaders) */
    renderer.render(world.scene, camera);
    shader.renderShaders();
    
    handleAmmoText(); // Update ammo text
    handleHealthText(); // Update health text
    document.getElementById('position').innerHTML = 'Position : ' + camera.position.x.toFixed(2) + ', ' + camera.position.y.toFixed(2) + ', ' + camera.position.z.toFixed(2);

    /* Debugging (stats) */
    if(settings.debugMode_stats) {
        stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(stats.domElement);
    } else
        stats.domElement.remove();
    
    stats.end(); // End performance tracking
}

/**
 * Handle player movement based on key presses
 */
function handleMovement() {
    if (keys['ArrowUp'] || keys['KeyW'])
        controls.moveForward(settings.playerVelocityMultiplier);
    if (keys['ArrowDown'] || keys['KeyS'])
        controls.moveForward(-settings.playerVelocityMultiplier);
    if (keys['ArrowLeft'] || keys['KeyA'])
        controls.moveRight(-settings.playerVelocityMultiplier);
    if (keys['ArrowRight'] || keys['KeyD'])
        controls.moveRight(settings.playerVelocityMultiplier);
}

/**
 * Event Listeners & Handlers
 */
init(); // Initialize the game

window.addEventListener( 'resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
});
document.addEventListener('keydown', (event) => {
    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.code === 'KeyD') {
            event.preventDefault();
            return;
        }
        if (event.ctrlKey && event.code === 'KeyS') {
            event.preventDefault();
            return;
        }
        if (event.key === 'Escape') {
            controls.unlock();
            toggleMenu();
            return;
        }
        keys[event.code] = true;
    });
    keys[event.code] = true
});
document.addEventListener('keyup', (event) => keys[event.code] = false);
document.addEventListener('click', () => {
    if(isHoveringSettings()) return;
    controls.lock();
}, false);
controls.addEventListener('lock', () => hideMenu());
controls.addEventListener('unlock', () => showMenu());