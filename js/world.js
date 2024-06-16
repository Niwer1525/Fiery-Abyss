import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import * as settings from './settings.js';
import * as utils from './util.js';

export let scene = new THREE.Scene();
let helpers = [];
let lights = [];
let entities = [];
let loot = [];
let fireballs = [];


const textureLoader = new THREE.TextureLoader();
const GLTFModelLoader = new GLTFLoader();

const lootImages = ['assets/loots/medic.png', 'assets/loots/ammo.png'];
const medicLoot = 0;
const ammoLoot = 1;

let camera;
let worldMesh;

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
        worldMesh = gltf.scene;
        worldMesh.position.set(0, -5, 0);
        worldMesh.scale.set(worldScale, worldScale, worldScale);
        worldMesh.castShadow = true;
        worldMesh.receiveShadow = true;
        scene.add(worldMesh);
    });

    /* Lights */
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.color.setHSL(0.1, 1, 0.95);
    dirLight.position.set(25, 15, 10);
    dirLight.position.multiplyScalar(30);
    dirLight.castShadow = true;
    
    const d = 150;
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
        'arid_ft.jpg',
        'arid_bk.jpg',
        'arid_up.jpg',
        'arid_dn.jpg',
        'arid_rt.jpg',
        'arid_if.jpg',
    ]);

    /* Fog */
    //scene.fog = new THREE.Fog(scene.background, 1, 5000);
    
    /* Loot */
    createParticle(75, 26, medicLoot);
    createParticle(175, -230, medicLoot);
    createParticle(275, -145, medicLoot);
    createParticle(-100, -210, medicLoot);
    createParticle(85, 185, medicLoot);
    createParticle(175, -220, ammoLoot);
    createParticle(255, 15, ammoLoot);
    createParticle(195, 145, ammoLoot);
    createParticle(-175, 12, ammoLoot);
    createParticle(-180, 35, ammoLoot);
    createParticle(142, 228, ammoLoot);
    createParticle(93, 312, ammoLoot);

    /* Enemies */
    createEnemy(10, 0, 10); // TEST ENEMY

    // createEnemy(307, 0, -184);
    // createEnemy(270, 0, -220);
    // createEnemy(207, 0, -284);
    // createEnemy(310, 0, -240);
    // createEnemy(200, 0, 215);
    // createEnemy(170, 0, 170);
    // createEnemy(190, 0, 30);
    // createEnemy(238, 0, 58);
    // createEnemy(12, 0, 300);
    // createEnemy(15, 0, 260);
    // createEnemy(110, 0, 312);
    // createEnemy(-295, 0, 10);
    // createEnemy(-88, 0, 188);
    // createEnemy(-172, 0, 15);
    // createEnemy(-195, 0, -218);
    // createEnemy(-42, 0, -306);
    // createEnemy(-190, 0, -129);
    // createEnemy(-222, 0, -230);
    // createEnemy(-51, 0, -95);
    // createEnemy(-130, 0, -7.45);
    // createEnemy(-178, 0, -208);
    // createEnemy(-100, 0, -185);
    // createEnemy(200, 0, -225);
    // createEnemy(88, 0, -248);
}

function addDebugHelpers(lights) {
    // Add helpers if debug mode is enabled
    if(settings.debugMode_lights && helpers.length === 0) {
        for(let i = 0; i < lights.length; i++) {
            if(lights[i].type === 'DirectionalLight') { // Directional light
                const dirLightHelper = new THREE.DirectionalLightHelper(lights[i], 10);
                const camHelper = new THREE.CameraHelper( lights[i].shadow.camera );
                // const spotLightHelper = new THREE.SpotLightHelper(spotLight, 10);
                helpers.push(dirLightHelper, camHelper);
                scene.add(dirLightHelper, camHelper);

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

function checkLineOfSight(position1, position2) {
    const raycaster = new THREE.Raycaster();
    const direction = new THREE.Vector3().subVectors(position2, position1).normalize();

    raycaster.set(position1, direction);
    
    const intersects = raycaster.intersectObjects(scene.children.filter(child => child === worldMesh));
    // console.log(intersects);
    return intersects.length === 0;
}

function createEnemy(x, y, z) {
    const material = new THREE.SpriteMaterial({ map: new THREE.TextureLoader().load('assets/enemies/dog.png') });
    const sprite = new THREE.Sprite(material);
    const scale = 4;
    sprite.scale.set(scale, scale, scale);
    sprite.position.set(x, -3.7, z);
    scene.add(sprite);

    entities.push({ mesh: sprite, health: 100 }); // Add the enemy to the entities array
    setInterval(() => {
        if(isMenuOpen()) return; // Don't shoot if the menu is open

        const canSeePlayer = checkLineOfSight(sprite.position, camera.position);
        // if (!canSeePlayer) return; // Don't shoot if the player is not in sight

        if(utils.distance(sprite.position.x, sprite.position.z, camera.position.x, camera.position.z) > 100)
            return; // Don't shoot if the player is too far (100 meters away)
        shootFireball(sprite);
    }, 2500 + 500 * Math.random()); // Shoot a fireball every 3 seconds (plus a random delay)
}

function shootFireball(enemyMesh) {
    const material = new THREE.SpriteMaterial({ map: new THREE.TextureLoader().load("assets/enemies/projectile.png") });
    const fireballMesh = new THREE.Sprite(material);
    const scale = 2;
    fireballMesh.scale.set(scale, scale, scale);

    fireballMesh.position.copy(enemyMesh.position);
    scene.add(fireballMesh);

    const direction = new THREE.Vector3().subVectors(camera.position, enemyMesh.position).normalize();
    fireballs.push({ mesh: fireballMesh, direction: direction, speed: 0.25, damages: 10, lifespan: 500 });

    let fireballAudio = new Audio('assets/enemies/fireball.mp3');
    fireballAudio.volume = 0.35;
    fireballAudio.play();
}