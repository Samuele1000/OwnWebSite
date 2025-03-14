// DOM Elements
const usernameOutput = document.getElementById('username-output');
const lengthSlider = document.getElementById('username-length-slider');
const lengthValue = document.getElementById('username-length-value');
const includeNumbers = document.getElementById('include-numbers');
const includeSpecial = document.getElementById('include-special');
const generateButton = document.getElementById('username-generate-button');
const copyButton = document.getElementById('username-copy-button');

// Karaktersets
const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
const numbers = '0123456789';
const special = '_-';

// Update length value display
if (lengthSlider && lengthValue) {
    lengthSlider.addEventListener('input', () => {
        lengthValue.textContent = lengthSlider.value;
    });
}

// Gebruikersnaam generatie functie
function generateUsername() {
    let chars = letters;
    let username = '';
    
    if (includeNumbers.checked) chars += numbers;
    if (includeSpecial.checked) chars += special;
    
    // Genereer basis gebruikersnaam
    for (let i = 0; i < lengthSlider.value; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        username += chars[randomIndex];
    }
    
    // Zorg ervoor dat er minimaal één nummer is als die optie is aangevinkt
    if (includeNumbers.checked && !/[0-9]/.test(username)) {
        const pos = Math.floor(Math.random() * username.length);
        username = username.substring(0, pos) + 
                  numbers[Math.floor(Math.random() * numbers.length)] +
                  username.substring(pos + 1);
    }
    
    // Zorg ervoor dat er minimaal één speciaal teken is als die optie is aangevinkt
    if (includeSpecial.checked && !/[_-]/.test(username)) {
        const pos = Math.floor(Math.random() * username.length);
        username = username.substring(0, pos) + 
                  special[Math.floor(Math.random() * special.length)] +
                  username.substring(pos + 1);
    }
    
    return username;
}

// Genereer gebruikersnaam bij klik op knop
if (generateButton) {
    generateButton.addEventListener('click', () => {
        const username = generateUsername();
        usernameOutput.value = username;
        
        // Voeg een subtiele animatie toe aan de generator container
        const container = document.querySelector('.generator-container');
        container.style.transform = 'scale(1.01)';
        setTimeout(() => {
            container.style.transform = 'scale(1)';
        }, 200);
    });
}

// Kopieer gebruikersnaam naar klembord
if (copyButton) {
    copyButton.addEventListener('click', () => {
        if (usernameOutput.value) {
            // Moderne manier om naar klembord te kopiëren
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(usernameOutput.value)
                    .then(() => {
                        // Visuele feedback
                        const originalText = copyButton.innerHTML;
                        copyButton.innerHTML = '<i class="fas fa-check"></i>';
                        setTimeout(() => {
                            copyButton.innerHTML = originalText;
                        }, 2000);
                    })
                    .catch(err => {
                        console.error('Kon niet kopiëren: ', err);
                        // Fallback naar de oude methode
                        fallbackCopy();
                    });
            } else {
                // Fallback voor browsers die navigator.clipboard niet ondersteunen
                fallbackCopy();
            }
        }
    });
}

// Fallback kopieer methode
function fallbackCopy() {
    usernameOutput.select();
    usernameOutput.setSelectionRange(0, 99999); // Voor mobiele apparaten
    document.execCommand('copy');
    
    // Visuele feedback
    const originalText = copyButton.innerHTML;
    copyButton.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        copyButton.innerHTML = originalText;
    }, 2000);
}

// Genereer initiële gebruikersnaam
document.addEventListener('DOMContentLoaded', () => {
    if (generateButton && usernameOutput) {
        generateButton.click();
        setupMobileExperience();
    }
});

// Verbeter de mobiele ervaring
function setupMobileExperience() {
    // Detecteer of het een mobiel apparaat is
    const isMobile = window.matchMedia("(max-width: 576px)").matches;
    
    if (isMobile && generateButton && copyButton) {
        // Zorg ervoor dat de focus wordt verwijderd na het genereren van een gebruikersnaam
        generateButton.addEventListener('click', () => {
            generateButton.blur();
        });
        
        // Zorg ervoor dat de focus wordt verwijderd na het kopiëren
        copyButton.addEventListener('click', () => {
            copyButton.blur();
            // Verwijder selectie op mobiel
            window.getSelection().removeAllRanges();
        });
    }
}

// Voer ook uit bij wijziging van de schermgrootte
window.addEventListener('resize', setupMobileExperience); 