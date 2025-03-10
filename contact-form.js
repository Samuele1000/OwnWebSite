// Discord webhook URL (dezelfde als in visitor-tracking.js)
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1348762922960027730/KiCxIrTuv5bihTxm6-1PmuWmWdpTZWG5r2Q2IKvYkIG9f-DWv_Uq8pNhcBOYPkjnscVt';

// Functie om IP informatie op te halen
async function getIPInfo() {
    try {
        const response = await fetch('https://api.ipify.org?format=json');
        const ipData = await response.json();
        
        // Haal extra IP informatie op
        const detailResponse = await fetch(`https://ipapi.co/${ipData.ip}/json/`);
        const details = await detailResponse.json();
        
        return {
            ip: ipData.ip,
            country: details.country_name || 'Onbekend',
            city: details.city || 'Onbekend'
        };
    } catch (error) {
        console.error('Fout bij ophalen IP informatie:', error);
        return {
            ip: 'Niet beschikbaar',
            country: 'Onbekend',
            city: 'Onbekend'
        };
    }
}

// Functie om het contactformulier te verwerken
async function handleContactForm(event) {
    event.preventDefault();
    
    const form = event.target;
    const statusElement = document.getElementById('contact-form-status');
    
    // Toon laadstatus
    statusElement.textContent = 'Bezig met verzenden...';
    statusElement.className = 'form-status';
    statusElement.style.display = 'block';
    
    try {
        // Verzamel formuliergegevens
        const formData = {
            name: form.elements['name'].value,
            email: form.elements['email'].value,
            subject: form.elements['subject'].value,
            message: form.elements['message'].value
        };
        
        // Haal IP informatie op
        const ipInfo = await getIPInfo();
        
        // Maak Discord embed
        const embed = {
            title: '📝 Nieuw Contactformulier Bericht',
            color: 3447003, // Blauw
            fields: [
                {
                    name: '👤 Contactgegevens',
                    value: `**Naam:** ${formData.name}\n**E-mail:** ${formData.email}`,
                    inline: false
                },
                {
                    name: '📋 Bericht',
                    value: `**Onderwerp:** ${getSubjectLabel(formData.subject)}\n**Bericht:** ${formData.message}`,
                    inline: false
                },
                {
                    name: '🌐 Afzenderinformatie',
                    value: `**IP:** ${ipInfo.ip}\n**Locatie:** ${ipInfo.city}, ${ipInfo.country}`,
                    inline: false
                }
            ],
            timestamp: new Date().toISOString()
        };
        
        // Verstuur naar Discord
        const response = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ embeds: [embed] })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Toon succes bericht
        statusElement.textContent = 'Bedankt voor uw bericht! We nemen zo snel mogelijk contact met u op.';
        statusElement.className = 'form-status success';
        
        // Reset formulier
        form.reset();
        
    } catch (error) {
        console.error('Fout bij verzenden formulier:', error);
        
        // Toon foutmelding
        statusElement.textContent = 'Er is een fout opgetreden bij het verzenden van uw bericht. Probeer het later opnieuw.';
        statusElement.className = 'form-status error';
    }
}

// Helper functie om onderwerp label te krijgen
function getSubjectLabel(value) {
    const subjects = {
        'inzage': 'Recht op inzage',
        'correctie': 'Recht op correctie',
        'verwijdering': 'Recht op verwijdering',
        'beperking': 'Recht op beperking',
        'bezwaar': 'Recht op bezwaar',
        'dataportabiliteit': 'Recht op dataportabiliteit',
        'vraag': 'Algemene vraag'
    };
    
    return subjects[value] || value;
}

// Voeg event listener toe aan het formulier wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('privacy-contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }
}); 