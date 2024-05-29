function toggleMenu() {
    const element = document.querySelector('.main_menu');
    element.classList.toggle('shown');
}

function hideMenu() {
    const element = document.querySelector('.main_menu');
    element.classList.remove('shown');
}

function showMenu() {
    const element = document.querySelector('.main_menu');
    element.classList.add('shown');
}

function isMenuOpen() {
    const element = document.querySelector('.main_menu');
    return element.classList.contains('shown');
}

function isHoveringSettings() {
    const element = document.getElementById('settings').querySelector(':hover');
    return element !== null;
}