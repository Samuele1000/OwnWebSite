// DOM Elements
const usernameOutput = document.getElementById('username-output');
const lengthSlider = document.getElementById('length-slider');
const lengthValue = document.getElementById('length-value');
const uppercaseCheckbox = document.getElementById('uppercase');
const lowercaseCheckbox = document.getElementById('lowercase');
const numbersCheckbox = document.getElementById('numbers');
const underscoreCheckbox = document.getElementById('underscore');
const generateButton = document.getElementById('generate-button');
const copyButton = document.getElementById('copy-button');

// Karaktersets voor gebruikersnaam generatie
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const numberChars = '0123456789';
const underscoreChar = '_';

// Update length value display
lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
});

// Gebruikersnaam generatie functie
function generateUsername() {
    let chars = '';
    let username = '';
    
    // Voeg geselecteerde karaktersets toe
    if (uppercaseCheckbox.checked) chars += uppercaseChars;
    if (lowercaseCheckbox.checked) chars += lowercaseChars;
    if (numbersCheckbox.checked) chars += numberChars;
    if (underscoreCheckbox.checked) chars += underscoreChar;
    
    // Als geen opties zijn geselecteerd, gebruik alle karakters
    if (!chars) {
        chars = uppercaseChars + lowercaseChars + numberChars + underscoreChar;
    }
    
    // Genereer gebruikersnaam
    for (let i = 0; i < lengthSlider.value; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        username += chars[randomIndex];
    }
    
    // Zorg ervoor dat de gebruikersnaam niet begint of eindigt met een underscore
    if (username.startsWith('_')) {
        username = username.substring(1);
        username = chars[Math.floor(Math.random() * chars.length)] + username;
    }
    if (username.endsWith('_')) {
        username = username.substring(0, username.length - 1);
        username = username + chars[Math.floor(Math.random() * chars.length)];
    }
    
    return username;
}

// Genereer gebruikersnaam bij klik op knop
generateButton.addEventListener('click', () => {
    usernameOutput.value = generateUsername();
});

// Kopieer gebruikersnaam naar klembord
copyButton.addEventListener('click', () => {
    if (usernameOutput.value) {
        usernameOutput.select();
        document.execCommand('copy');
        
        // Visuele feedback
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyButton.innerHTML = originalText;
        }, 2000);
    }
});

// Genereer initieel gebruikersnaam
generateButton.click();

// Voorkom dat het gebruikersnaamveld leeg kan worden gelaten
usernameOutput.addEventListener('input', () => {
    if (!usernameOutput.value) {
        generateButton.click();
    }
}); 