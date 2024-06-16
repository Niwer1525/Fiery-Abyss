const maxHealth = 100;
const healthLoot = 10;
let health = maxHealth / 2;

function onPickupMedic() {
    if(health >= maxHealth) return false; // Don't pick up if health is full
    
    health += healthLoot; // Add the health
    if(health > maxHealth) // Health can't go over 100
        health = maxHealth;

    let pickupAudio = new Audio('../assets/loots/health_pickup.mp3');
    pickupAudio.volume = 0.35;
    pickupAudio.play();
    return true;
}

function handleHealthText() {
    document.getElementById('health').innerHTML = `Health: ${health}`;
}

function damagePlayer(amount) {
    health -= amount;
    if(health <= 0) {
        health = 0;
        alert('You are dead!');
        location.reload();
    }
}