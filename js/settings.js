/* Debug mode settings */
export let debugMode_other = false;
export let debugMode_wireframe = false;
export let debugMode_stats = false;
export let debugMode_lights = false;
export let debugMode_rays = false;

/* Game settings */
export let mouse_sensitivity = 0.002;
export let playerVelocityMultiplier = 0.35;
export let maxAmmo = 10;

// Get settings from cookies
const cookies = document.cookie.split(';');
cookies.forEach(cookie => {
    const [name, value] = cookie.trim().split('=');
    switch (name) {
        case 'mouse_sensitivity':
            mouse_sensitivity = parseFloat(value);
            break;
        case 'playerVelocityMultiplier':
            playerVelocityMultiplier = parseFloat(value);
            break;
        case 'maxAmmo':
            maxAmmo = parseInt(value);
            break;
        case 'debugMode_other':
            debugMode_other = value === 'true';
            break;
        case 'debugMode_wireframe':
            debugMode_wireframe = value === 'true';
            break;
        case 'debugMode_stats':
            debugMode_stats = value === 'true';
            break;
        case 'debugMode_lights':
            debugMode_lights = value === 'true';
            break;
        case 'debugMode_rays':
            debugMode_rays = value === 'true';
            break;
    }
});

export function displaySettings() {
    document.getElementById('settings').innerHTML = `
        <h2>Settings</h2>
        <label>Mouse sensitivity (Default: 0.002)
            <input type="number" value="${mouse_sensitivity}" id="mouse_sensitivity">
        </label>
        <label>Player velocity multiplier (Default: 0.35)
            <input type="number" value="${playerVelocityMultiplier}" id="player_velocity">
        </label>
        <label>Max magazine ammo (Default: 10)
            <input type="number" value="${maxAmmo}" id="max_ammo">
        </label>
        

        <details>
            <summary>Debug mode settings</summary>
            ${displayDebugModeSettings()}
        </details>
    `;
}

function displayDebugModeSettings() {
    return `
        <label class="checkbox_label">Other debug mode :
            <input type="checkbox" ${debugMode_other ? 'checked' : ''} id="debug_other">
        </label>
        <label class="checkbox_label">Wireframe mode :
            <input type="checkbox" ${debugMode_wireframe ? 'checked' : ''} id="debug_wireframe">
        </label>
        <label class="checkbox_label">Stats :
            <input type="checkbox" ${debugMode_stats ? 'checked' : ''} id="debug_stats">
        </label>
        <label class="checkbox_label">Lights :
            <input type="checkbox" ${debugMode_lights ? 'checked' : ''} id="debug_lights">
        </label>
        <label class="checkbox_label">Rays :
            <input type="checkbox" ${debugMode_rays ? 'checked' : ''} id="debug_rays">
        </label>
    `;
}

export function saveSettings() {
    // Save settings to let variables
    mouse_sensitivity = parseFloat(document.getElementById('mouse_sensitivity').value);
    playerVelocityMultiplier = parseFloat(document.getElementById('player_velocity').value);
    maxAmmo = parseInt(document.getElementById('max_ammo').value);
    debugMode_other = document.getElementById('debug_other').checked;
    debugMode_wireframe = document.getElementById('debug_wireframe').checked;
    debugMode_stats = document.getElementById('debug_stats').checked;
    debugMode_lights = document.getElementById('debug_lights').checked;
    debugMode_rays = document.getElementById('debug_rays').checked;

    // Save settings as cookies
    document.cookie = `mouse_sensitivity=${mouse_sensitivity}`;
    document.cookie = `playerVelocityMultiplier=${playerVelocityMultiplier}`;
    document.cookie = `maxAmmo=${maxAmmo}`;
    document.cookie = `debugMode_other=${debugMode_other}`;
    document.cookie = `debugMode_wireframe=${debugMode_wireframe}`;
    document.cookie = `debugMode_stats=${debugMode_stats}`;
    document.cookie = `debugMode_lights=${debugMode_lights}`;
    document.cookie = `debugMode_rays=${debugMode_rays}`;
}