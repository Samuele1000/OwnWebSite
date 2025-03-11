// Taal gerelateerde variabelen
let currentLanguage = 'nl';
let translations = {};

// Laad vertalingen
async function loadTranslations(lang) {
    try {
        const response = await fetch(`translations/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        translations = await response.json();
        return translations;
    } catch (error) {
        console.error('Error loading translations:', error);
        return null;
    }
}

// Update alle tekst elementen met vertalingen
function updatePageText() {
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const keys = element.getAttribute('data-i18n').split('.');
        let value = translations;
        
        for (const key of keys) {
            if (value && key in value) {
                value = value[key];
            } else {
                console.error(`Translation missing for key: ${keys.join('.')}`);
                return;
            }
        }

        if (value) {
            if (element.tagName === 'INPUT' && element.type === 'text') {
                element.placeholder = value;
            } else if (element === document.querySelector('title')) {
                document.title = value;
            } else if (element.tagName === 'BUTTON' && element.id === 'copy-button') {
                // Behoud de icon voor de kopieerknop
                element.innerHTML = `<i class="fas fa-copy"></i>`;
            } else {
                element.textContent = value;
            }
        }
    });

    // Update specifieke elementen die geen data-i18n attribuut hebben
    const strengthLabel = document.getElementById('strength-label');
    if (strengthLabel) {
        const currentStrength = strengthLabel.textContent.toLowerCase();
        if (translations.generator && translations.generator.strength) {
            if (currentStrength === 'sterk' || currentStrength === 'strong' || currentStrength === 'forte') {
                strengthLabel.textContent = translations.generator.strength.strong;
            } else if (currentStrength === 'gemiddeld' || currentStrength === 'medium' || currentStrength === 'medio') {
                strengthLabel.textContent = translations.generator.strength.medium;
            } else {
                strengthLabel.textContent = translations.generator.strength.weak;
            }
        }
    }
}

// Taal wissel event handler
document.getElementById('language-select').addEventListener('change', async (e) => {
    const newLang = e.target.value;
    const translations = await loadTranslations(newLang);
    
    if (translations) {
        document.documentElement.lang = newLang;
        currentLanguage = newLang;
        updatePageText();
        
        // Update het data-selected attribuut voor de vlag
        document.querySelector('.language-selector').setAttribute('data-selected', newLang);
        
        // Sla de taalvoorkeur op in localStorage
        localStorage.setItem('preferredLanguage', newLang);
    }
});

// Laad de opgeslagen taalvoorkeur bij het laden van de pagina
document.addEventListener('DOMContentLoaded', async () => {
    const savedLanguage = localStorage.getItem('preferredLanguage');
    if (savedLanguage) {
        currentLanguage = savedLanguage;
        document.getElementById('language-select').value = savedLanguage;
        
        // Update het data-selected attribuut voor de vlag
        document.querySelector('.language-selector').setAttribute('data-selected', savedLanguage);
    }
    
    const translations = await loadTranslations(currentLanguage);
    if (translations) {
        document.documentElement.lang = currentLanguage;
        updatePageText();
    }
});

// Voeg vertalingen toe voor wachtwoordsterkte
const strengthTranslations = {
    nl: {
        weak: "Zwak",
        medium: "Gemiddeld",
        strong: "Sterk"
    },
    en: {
        weak: "Weak",
        medium: "Medium",
        strong: "Strong"
    },
    it: {
        weak: "Debole",
        medium: "Medio",
        strong: "Forte"
    }
};

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