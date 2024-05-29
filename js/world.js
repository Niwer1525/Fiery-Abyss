import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as utils from './util.js';
import * as settings from './settings.js';

export let scene = new THREE.Scene();
let helpers = [];
let lights = [];
let entities = [];
let loot = [];
let fireballs = [];

const clock = new THREE.Clock();
const textureLoader = new THREE.TextureLoader();
const GLTFModelLoader = new GLTFLoader();

const lootImages = ['assets/loots/medic.png', 'assets/loots/ammo.png'];
const medicLoot = 0;
const ammoLoot = 1;

let camera;

function createDecal(x, y, z) {
    // const m = new THREE.Mesh( new DecalGeometry( mesh, position, orientation, size ), material );
}

function createParticle(x, z, type) {
    const material = new THREE.SpriteMaterial({ map: new THREE.TextureLoader().load(lootImages[type]) });
    const sprite = new THREE.Sprite(material);
    const scale = 4;
    sprite.scale.set(scale, scale, scale);
    sprite.position.set(x, -3.5, z);
    
    scene.add(sprite);
    loot.push({sprite: sprite, lootType: type});
}
/**
 * Create the scene (Lights, Floor, Walls, etc)
 */
export function createScene(cam) {
    camera = cam;

    /* World itself */
    GLTFModelLoader.load('assets/world/main_world.glb', (gltf) => {
        const worldScale = 325;
        const worldMesh = gltf.scene;
        worldMesh.position.set(0, -5, 0);
        worldMesh.scale.set(worldScale, worldScale, worldScale);
        scene.add(worldMesh);
    });

    /* Lights */
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(-1, 1.75, 1);
    dirLight.position.multiplyScalar(30);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    const d = 50;

    dirLight.shadow.camera.left = - d;
    dirLight.shadow.camera.right = d;
    dirLight.shadow.camera.top = d;
    dirLight.shadow.camera.bottom = - d;

    dirLight.shadow.camera.far = 3500;
    dirLight.shadow.bias = - 0.0001;
    lights.push(dirLight);
    scene.add(dirLight);

    /* Skybox */
    scene.background = new THREE.CubeTextureLoader().setPath('assets/sky/').load([
        'arid_if.jpg',
        'arid_rt.jpg',
        'arid_up.jpg',
        'arid_dn.jpg',
        'arid_ft.jpg',
        'arid_bk.jpg',
    ]);

    /* Fog */
    //scene.fog = new THREE.Fog(scene.background, 1, 5000);

    /* Loot */
    createParticle(0, 10, medicLoot);
    createParticle(20, 10, medicLoot);
    createParticle(10, 10, ammoLoot);
    createParticle(20, 15, ammoLoot);

    /* Enemies */
    createEnemy(10, 0, 10);
}

function addDebugHelpers(lights) {
    // Add helpers if debug mode is enabled
    if(settings.debugMode_lights && helpers.length === 0) {
        for(let i = 0; i < lights.length; i++) {
            if(lights[i].type === 'DirectionalLight') { // Directional light
                const dirLightHelper = new THREE.DirectionalLightHelper(lights[i], 10);
                // const spotLightHelper = new THREE.SpotLightHelper(spotLight, 10);
                helpers.push(dirLightHelper);
                scene.add(dirLightHelper);

                continue; // Skip the rest of the loop
            }
        }
    }

    // Remove helpers if debug mode is disabled
    if(settings.debugMode_lights) return;
    for(let i = 0; i < helpers.length; i++) {
        scene.remove(helpers[i]);
        helpers.splice(i, 1);
    }
}

export function handleWorld() {
    /* Handle helpers */
    addDebugHelpers(lights);

    /* Handle loots */
    for(let i = 0; i < loot.length; i++) {
        const sprite = loot[i].sprite;
        const spritePos = sprite.position;
        const cameraPos = camera.position;

        if(utils.distance(spritePos.x, spritePos.z, cameraPos.x, cameraPos.z) < 5) {
            let hasPickedUp = false;
            switch(loot[i].lootType) {
                case medicLoot:
                    hasPickedUp = onPickupMedic();
                    break;
                case ammoLoot:
                    hasPickedUp = onPickupAmmo();
                    break;
            }

            /* Remove the sprite and loot from the array */
            if(hasPickedUp) { // If the player picked up the loot
                scene.remove(sprite);
                loot.splice(i, 1);
            }
        }
    }

    /* Handle fireballs */
    for(let i = 0; i < fireballs.length; i++) {
        const fireball = fireballs[i];
        fireball.mesh.position.add(fireball.direction.clone().multiplyScalar(fireball.speed));

        if(utils.distance(fireball.mesh.position.x, fireball.mesh.position.z, camera.position.x, camera.position.z) < 1) {
            damagePlayer(fireball.damages);
            scene.remove(fireball.mesh);
            fireballs.splice(i, 1);
        }

        /* Remove the fireball if it's too far */
        fireball.lifespan--;
        if(fireball.lifespan <= 0) {
            scene.remove(fireball.mesh);
            fireballs.splice(i, 1);
        }
    }
}

function createEnemy(x, y, z) {
    const enemyGeometry = new THREE.BoxGeometry(1, 1, 1);
    const enemyMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const enemyMesh = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemyMesh.position.set(x, y, z);
    scene.add(enemyMesh);

    entities.push({ mesh: enemyMesh, health: 100 }); // Add the enemy to the entities array
    setInterval(() => {
        if(isMenuOpen()) return; // Don't shoot if the menu is open
        if(utils.distance(enemyMesh.position.x, enemyMesh.position.z, camera.position.x, camera.position.z) > 100) 
            return; // Don't shoot if the player is too far (100 meters away)
        shootFireball(enemyMesh);
    }, 3000); // Shoot a fireball every 3 seconds
}

function shootFireball(enemyMesh) {
    const material = new THREE.SpriteMaterial({ map: new THREE.TextureLoader().load("assets/enemies/projectile.png") });
    const fireballMesh = new THREE.Sprite(material);
    const scale = 2;
    fireballMesh.scale.set(scale, scale, scale);

    fireballMesh.position.copy(enemyMesh.position);
    scene.add(fireballMesh);

    const direction = new THREE.Vector3().subVectors(camera.position, enemyMesh.position).normalize();
    fireballs.push({ mesh: fireballMesh, direction: direction, speed: 0.25, damages: 10, lifespan: 5000 });

    let fireballAudio = new Audio('assets/enemies/fireball.mp3');
    fireballAudio.volume = 0.35;
    fireballAudio.play();
}