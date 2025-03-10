// DOM Elements
const passwordOutput = document.getElementById('password-output');
const lengthSlider = document.getElementById('length-slider');
const lengthValue = document.getElementById('length-value');
const uppercaseCheckbox = document.getElementById('uppercase');
const lowercaseCheckbox = document.getElementById('lowercase');
const numbersCheckbox = document.getElementById('numbers');
const symbolsCheckbox = document.getElementById('symbols');
const generateButton = document.getElementById('generate-button');
const copyButton = document.getElementById('copy-button');
const strengthLabel = document.getElementById('strength-label');
const strengthBarFill = document.querySelector('.strength-bar-fill');

// Karaktersets voor wachtwoord generatie
const uppercaseChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const lowercaseChars = 'abcdefghijklmnopqrstuvwxyz';
const numberChars = '0123456789';
const symbolChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';

// Update length value display
lengthSlider.addEventListener('input', () => {
    lengthValue.textContent = lengthSlider.value;
});

// Bereken wachtwoordsterkte
function calculatePasswordStrength(password) {
    let score = 0;
    
    // Lengte check
    if (password.length >= 12) score += 2;
    else if (password.length >= 8) score += 1;
    
    // Karakterset checks
    if (/[A-Z]/.test(password)) score += 1;
    if (/[a-z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    
    // Variatie check
    const uniqueChars = new Set(password).size;
    if (uniqueChars > password.length * 0.7) score += 1;
    
    return score;
}

// Update sterkte-indicator
function updateStrengthIndicator(password) {
    const score = calculatePasswordStrength(password);
    
    if (score >= 6) {
        strengthLabel.textContent = 'Sterk';
        strengthLabel.style.color = '#2ecc71';
        strengthBarFill.className = 'strength-bar-fill strong';
    } else if (score >= 4) {
        strengthLabel.textContent = 'Gemiddeld';
        strengthLabel.style.color = '#f1c40f';
        strengthBarFill.className = 'strength-bar-fill medium';
    } else {
        strengthLabel.textContent = 'Zwak';
        strengthLabel.style.color = '#e74c3c';
        strengthBarFill.className = 'strength-bar-fill weak';
    }
}

// Wachtwoord generatie functie
function generatePassword() {
    let chars = '';
    let password = '';
    
    // Voeg geselecteerde karaktersets toe
    if (uppercaseCheckbox.checked) chars += uppercaseChars;
    if (lowercaseCheckbox.checked) chars += lowercaseChars;
    if (numbersCheckbox.checked) chars += numberChars;
    if (symbolsCheckbox.checked) chars += symbolChars;
    
    // Als geen opties zijn geselecteerd, gebruik alle karakters
    if (!chars) {
        chars = uppercaseChars + lowercaseChars + numberChars + symbolChars;
        // Zet alle checkboxes aan
        uppercaseCheckbox.checked = true;
        lowercaseCheckbox.checked = true;
        numbersCheckbox.checked = true;
        symbolsCheckbox.checked = true;
    }
    
    // Genereer wachtwoord
    for (let i = 0; i < lengthSlider.value; i++) {
        const randomIndex = Math.floor(Math.random() * chars.length);
        password += chars[randomIndex];
    }
    
    // Zorg ervoor dat het wachtwoord minimaal één karakter van elke geselecteerde set bevat
    if (uppercaseCheckbox.checked && !/[A-Z]/.test(password)) {
        const pos = Math.floor(Math.random() * password.length);
        password = password.substring(0, pos) + 
                  uppercaseChars[Math.floor(Math.random() * uppercaseChars.length)] +
                  password.substring(pos + 1);
    }
    if (lowercaseCheckbox.checked && !/[a-z]/.test(password)) {
        const pos = Math.floor(Math.random() * password.length);
        password = password.substring(0, pos) + 
                  lowercaseChars[Math.floor(Math.random() * lowercaseChars.length)] +
                  password.substring(pos + 1);
    }
    if (numbersCheckbox.checked && !/[0-9]/.test(password)) {
        const pos = Math.floor(Math.random() * password.length);
        password = password.substring(0, pos) + 
                  numberChars[Math.floor(Math.random() * numberChars.length)] +
                  password.substring(pos + 1);
    }
    if (symbolsCheckbox.checked && !/[^A-Za-z0-9]/.test(password)) {
        const pos = Math.floor(Math.random() * password.length);
        password = password.substring(0, pos) + 
                  symbolChars[Math.floor(Math.random() * symbolChars.length)] +
                  password.substring(pos + 1);
    }
    
    return password;
}

// Genereer wachtwoord bij klik op knop
generateButton.addEventListener('click', () => {
    const password = generatePassword();
    passwordOutput.value = password;
    updateStrengthIndicator(password);
    
    // Voeg een subtiele animatie toe aan de generator container
    const container = document.querySelector('.generator-container');
    container.style.transform = 'scale(1.01)';
    setTimeout(() => {
        container.style.transform = 'scale(1)';
    }, 200);
});

// Kopieer wachtwoord naar klembord
copyButton.addEventListener('click', () => {
    if (passwordOutput.value) {
        passwordOutput.select();
        document.execCommand('copy');
        
        // Visuele feedback
        const originalText = copyButton.innerHTML;
        copyButton.innerHTML = '<i class="fas fa-check"></i>';
        setTimeout(() => {
            copyButton.innerHTML = originalText;
        }, 2000);
    }
});

// Genereer initieel wachtwoord
generateButton.click();

// Voorkom dat het wachtwoordveld leeg kan worden gelaten
passwordOutput.addEventListener('input', () => {
    if (!passwordOutput.value) {
        generateButton.click();
    }
});

// Update sterkte-indicator bij checkbox verandering
[uppercaseCheckbox, lowercaseCheckbox, numbersCheckbox, symbolsCheckbox].forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        if (passwordOutput.value) {
            updateStrengthIndicator(passwordOutput.value);
        }
    });
}); 