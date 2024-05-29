const firingDelay = 100; // Adjust the delay (in milliseconds) as per your requirement
const maxAmmo = 10; // Maximum ammo in a magazine
const ammoLoot = 10; // Amount of ammo in a loot

let availableAmmo = 10;
let currentAmmo = availableAmmo / 2;
let hasFired = false;

document.addEventListener('click', function(event) {
    if (!isMenuOpen() && currentAmmo > 0 && event.button === 0 && hasFired === false) {
        document.getElementById('weapon').classList.add('firing');

        let fireAudio = new Audio('../assets/gun/pan.mp3');
        fireAudio.volume = 0.5;
        // fireAudio.play();

        hasFired = true;
        currentAmmo--;

        setTimeout(function() {
            document.getElementById('weapon').classList.remove('firing');
            hasFired = false;
        }, firingDelay); // Adjust the delay (in milliseconds) as per your requirement
        
        event.preventDefault(); // Prevent the default action
    }
});

document.addEventListener('keydown', function(event) {
    if (event.key === 'r' && currentAmmo < maxAmmo && availableAmmo > 0) {
        let newMag = Math.min(maxAmmo - currentAmmo, availableAmmo);
        currentAmmo += newMag;
        availableAmmo -= newMag;

        let reloadAudio = new Audio('../assets/gun/reload.mp3');
        reloadAudio.volume = 0.25;
        reloadAudio.play();
    }
});

function handleAmmoText() {
    document.getElementById('ammo').innerHTML = 'Ammo : '+currentAmmo+'/'+availableAmmo;
}

/**
 * This function is called when the player picks up ammo loot
 */
function onPickupAmmo() {
    availableAmmo += ammoLoot; // Increase the available ammo by 10

    let pickupAudio = new Audio('../assets/gun/ammo_pickup.mp3');
    pickupAudio.volume = 0.35;
    pickupAudio.play();
    return true;
}

/* function checkIntersection(x, y, mesh) {
    if (mesh === undefined) return;

    mouse.x = ( x / window.innerWidth ) * 2 - 1;
    mouse.y = - ( y / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    raycaster.intersectObject( mesh, false, intersects );

    if (intersects.length > 0) {

        const p = intersects[ 0 ].point;
        mouseHelper.position.copy( p );
        intersection.point.copy( p );

        const n = intersects[ 0 ].face.normal.clone();
        n.transformDirection( mesh.matrixWorld );
        n.multiplyScalar( 10 );
        n.add( intersects[ 0 ].point );

        intersection.normal.copy( intersects[ 0 ].face.normal );
        mouseHelper.lookAt( n );

        const positions = line.geometry.attributes.position;
        positions.setXYZ( 0, p.x, p.y, p.z );
        positions.setXYZ( 1, n.x, n.y, n.z );
        positions.needsUpdate = true;

        intersection.intersects = true;

        intersects.length = 0;
        
        return;
    }
    intersection.intersects = false;
} */

function shootFireball(mesh, body) {
    const fireballGeometry = new THREE.SphereGeometry(0.2, 16, 16);
    const fireballMaterial = new THREE.MeshBasicMaterial({ color: 0xffa500 });
    const fireballMesh = new THREE.Mesh(fireballGeometry, fireballMaterial);

    fireballMesh.position.copy(mesh.position);
    scene.add(fireballMesh);

    const shape = new CANNON.Sphere(0.2);
    const fireballBody = new CANNON.Body({ mass: 0.1 });
    fireballBody.addShape(shape);
    fireballBody.position.copy(body.position);

    const direction = new THREE.Vector3().subVectors(camera.position, mesh.position).normalize();
    fireballBody.velocity.set(direction.x * 10, direction.y * 10, direction.z * 10);

    world.addBody(fireballBody);

    // Synchronize Three.js and Cannon.js objects
    fireballBody.mesh = fireballMesh;
    fireballBodies.push(fireballBody);
}