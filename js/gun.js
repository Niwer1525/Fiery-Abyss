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