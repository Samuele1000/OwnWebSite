// Discord webhook URL
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1348762922960027730/KiCxIrTuv5bihTxm6-1PmuWmWdpTZWG5r2Q2IKvYkIG9f-DWv_Uq8pNhcBOYPkjnscVt';

// Functie om IP informatie op te halen
async function getIPInfo() {
    try {
        // Gebruik alleen de ingebouwde browser API's om informatie te verzamelen
        // Geen externe API's gebruiken omdat de site op GitHub wordt gehost
        
        // Verzamel beschikbare informatie uit de navigator en window objecten
        const language = navigator.language || 'Onbekend';
        const languages = navigator.languages ? navigator.languages.join(', ') : 'Onbekend';
        const platform = navigator.platform || 'Onbekend';
        const userAgent = navigator.userAgent || 'Onbekend';
        const vendor = navigator.vendor || 'Onbekend';
        const cookieEnabled = navigator.cookieEnabled;
        const doNotTrack = navigator.doNotTrack || 'Onbekend';
        const screenWidth = window.screen.width || 'Onbekend';
        const screenHeight = window.screen.height || 'Onbekend';
        const screenColorDepth = window.screen.colorDepth || 'Onbekend';
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Onbekend';
        const timezoneOffset = new Date().getTimezoneOffset() || 'Onbekend';
        
        // Verzamel informatie over de verbinding als die beschikbaar is
        let connection = {};
        if (navigator.connection) {
            connection = {
                effectiveType: navigator.connection.effectiveType || 'Onbekend',
                downlink: navigator.connection.downlink || 'Onbekend',
                rtt: navigator.connection.rtt || 'Onbekend',
                saveData: navigator.connection.saveData || false
            };
        }
        
        // Verzamel informatie over de hardware
        const hardwareConcurrency = navigator.hardwareConcurrency || 'Onbekend';
        const deviceMemory = navigator.deviceMemory || 'Onbekend';
        
        // Verzamel informatie over de browser capabilities
        const webdriver = navigator.webdriver || false;
        
        // Verzamel informatie over de locatie (zonder externe API's)
        const locationInfo = {
            country: language.split('-')[1] || 'Onbekend',
            language: language.split('-')[0] || 'Onbekend'
        };
        
        return {
            ip: 'Niet beschikbaar zonder externe API',
            provider: 'Niet beschikbaar zonder externe API',
            hostname: 'Niet beschikbaar zonder externe API',
            socket: 'Niet beschikbaar zonder externe API',
            country: locationInfo.country,
            city: 'Niet beschikbaar zonder externe API',
            isp: 'Niet beschikbaar zonder externe API',
            asn: 'Niet beschikbaar zonder externe API',
            region: 'Niet beschikbaar zonder externe API',
            timezone: timezone,
            loc: 'Niet beschikbaar zonder externe API',
            isVpnFromApi: false,
            threat: {},
            
            // Extra informatie die we lokaal kunnen verzamelen
            userAgent: userAgent,
            platform: platform,
            vendor: vendor,
            language: language,
            languages: languages,
            cookieEnabled: cookieEnabled,
            doNotTrack: doNotTrack,
            screenResolution: `${screenWidth}x${screenHeight}`,
            colorDepth: screenColorDepth,
            timezoneOffset: timezoneOffset,
            connection: connection,
            hardwareConcurrency: hardwareConcurrency,
            deviceMemory: deviceMemory,
            webdriver: webdriver
        };
    } catch (error) {
        console.error('Fout bij ophalen informatie:', error);
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
            loc: 'Onbekend',
            isVpnFromApi: false,
            threat: {}
        };
    }
}

// Functie om te controleren of een gebruiker een VPN gebruikt
async function checkVPN(ipInfo) {
    try {
        console.log('VPN-detectie gestart met lokale methoden...');
        
        // Verzamel alle beschikbare informatie die kan wijzen op VPN-gebruik
        const indicators = [];
        let detectedVPN = { detected: false, vpnName: null };
        
        // 1. WebRTC leak test - kan helpen bij het detecteren van VPN's
        let webRTCResult = await checkWebRTC();
        if (webRTCResult.isVPN) {
            console.log('VPN gedetecteerd via WebRTC leak test');
            indicators.push('WebRTC leak test: IP-discrepantie gedetecteerd');
            detectedVPN = { detected: true, vpnName: 'Onbekende VPN (WebRTC)' };
            return { isVPN: true, vpnInfo: detectedVPN };
        }
        
        // 2. Controleer op bekende VPN-gerelateerde eigenschappen in de user agent
        const userAgentLower = ipInfo.userAgent.toLowerCase();
        const vpnUserAgentKeywords = ['vpn', 'proxy', 'tunnel', 'tor', 'nord', 'express', 'cyberghost', 'proton'];
        
        for (const keyword of vpnUserAgentKeywords) {
            if (userAgentLower.includes(keyword)) {
                console.log(`VPN gedetecteerd via user agent: ${keyword}`);
                indicators.push(`User agent bevat VPN-gerelateerde term: ${keyword}`);
                detectedVPN = { detected: true, vpnName: `VPN (${keyword})` };
                return { isVPN: true, vpnInfo: detectedVPN };
            }
        }
        
        // 3. Controleer op bekende VPN-gerelateerde eigenschappen in de browser
        if (ipInfo.webdriver) {
            console.log('Mogelijk VPN gedetecteerd: webdriver is ingeschakeld');
            indicators.push('Webdriver is ingeschakeld');
        }
        
        // 4. Controleer op inconsistenties in tijdzone en taal
        if (ipInfo.country && ipInfo.timezone) {
            const timezoneCountry = getCountryFromTimezone(ipInfo.timezone);
            if (timezoneCountry && timezoneCountry !== ipInfo.country) {
                console.log(`Mogelijk VPN gedetecteerd: tijdzone (${ipInfo.timezone}) komt niet overeen met land (${ipInfo.country})`);
                indicators.push(`Tijdzone (${ipInfo.timezone}) komt niet overeen met land (${ipInfo.country})`);
                detectedVPN = { detected: true, vpnName: 'Geografische Inconsistentie' };
                return { isVPN: true, vpnInfo: detectedVPN };
            }
        }
        
        // 5. Controleer op bekende VPN-gerelateerde eigenschappen in de verbinding
        if (ipInfo.connection && ipInfo.connection.effectiveType === '4g' && ipInfo.connection.rtt > 100) {
            console.log('Mogelijk VPN gedetecteerd: hoge latentie op 4G-verbinding');
            indicators.push('Hoge latentie op 4G-verbinding');
        }
        
        // 6. Controleer op NordVPN specifieke eigenschappen
        if (detectNordVPN(ipInfo)) {
            console.log('NordVPN gedetecteerd via specifieke eigenschappen');
            indicators.push('NordVPN specifieke eigenschappen gedetecteerd');
            detectedVPN = { detected: true, vpnName: 'NordVPN' };
            return { isVPN: true, vpnInfo: detectedVPN };
        }
        
        // 7. Controleer op Google VPN specifieke eigenschappen
        if (isGoogleVPN(ipInfo)) {
            console.log('Google VPN gedetecteerd via specifieke eigenschappen');
            indicators.push('Google VPN specifieke eigenschappen gedetecteerd');
            detectedVPN = { detected: true, vpnName: 'Google VPN' };
            return { isVPN: true, vpnInfo: detectedVPN, isGoogleVPN: true };
        }
        
        // 8. Controleer op andere populaire VPN-diensten
        const vpnDetectionResult = detectPopularVPNs(ipInfo);
        if (vpnDetectionResult.detected) {
            console.log(`${vpnDetectionResult.vpnName} VPN gedetecteerd via specifieke eigenschappen`);
            indicators.push(`${vpnDetectionResult.vpnName} specifieke eigenschappen gedetecteerd`);
            detectedVPN = vpnDetectionResult;
            return { isVPN: true, vpnInfo: detectedVPN };
        }
        
        // Als er meerdere indicatoren zijn, is het waarschijnlijk een VPN
        if (indicators.length >= 2) {
            console.log(`VPN gedetecteerd op basis van meerdere indicatoren: ${indicators.join(', ')}`);
            detectedVPN = { detected: true, vpnName: 'Onbekende VPN' };
            return { isVPN: true, vpnInfo: detectedVPN };
        }
        
        console.log('Geen VPN gedetecteerd met lokale methoden');
        return { isVPN: false, vpnInfo: null };
    } catch (error) {
        console.error('Fout bij controleren VPN:', error);
        return { isVPN: false, vpnInfo: null };
    }
}

// Functie om WebRTC te gebruiken voor VPN-detectie
async function checkWebRTC() {
    return new Promise((resolve) => {
        try {
            const rtcPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
            
            if (!rtcPeerConnection) {
                resolve({ isVPN: false, localIPs: [] });
                return;
            }
            
            const pc = new rtcPeerConnection({
                iceServers: [{ urls: "stun:stun.l.google.com:19302" }]
            });
            
            const localIPs = new Set();
            let isVPN = false;
            
            pc.createDataChannel("");
            
            pc.onicecandidate = (e) => {
                if (!e.candidate) {
                    pc.close();
                    resolve({ isVPN: isVPN, localIPs: Array.from(localIPs) });
                    return;
                }
                
                const ipRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3})/;
                const ipMatch = ipRegex.exec(e.candidate.candidate);
                
                if (ipMatch && ipMatch[1]) {
                    const localIp = ipMatch[1];
                    localIPs.add(localIp);
                    
                    // Als het IP niet een privé IP is, kan het wijzen op een VPN
                    if (!isPrivateIP(localIp)) {
                        isVPN = true;
                    }
                }
            };
            
            pc.createOffer()
                .then(offer => pc.setLocalDescription(offer))
                .catch(err => {
                    console.error('Fout bij WebRTC check:', err);
                    resolve({ isVPN: false, localIPs: [] });
                });
            
            // Timeout na 5 seconden
            setTimeout(() => {
                pc.close();
                resolve({ isVPN: isVPN, localIPs: Array.from(localIPs) });
            }, 5000);
        } catch (error) {
            console.error('Fout bij WebRTC check:', error);
            resolve({ isVPN: false, localIPs: [] });
        }
    });
}

// Functie om te controleren of een IP-adres privé is
function isPrivateIP(ip) {
    const parts = ip.split('.');
    if (parts.length !== 4) return false;
    
    const firstOctet = parseInt(parts[0], 10);
    const secondOctet = parseInt(parts[1], 10);
    
    // Check voor privé IP-ranges
    return (
        firstOctet === 10 || // 10.0.0.0 - 10.255.255.255
        (firstOctet === 172 && secondOctet >= 16 && secondOctet <= 31) || // 172.16.0.0 - 172.31.255.255
        (firstOctet === 192 && secondOctet === 168) || // 192.168.0.0 - 192.168.255.255
        (firstOctet === 169 && secondOctet === 254) || // 169.254.0.0 - 169.254.255.255
        firstOctet === 127 // 127.0.0.0 - 127.255.255.255
    );
}

// Functie om land te bepalen op basis van tijdzone
function getCountryFromTimezone(timezone) {
    const timezoneMap = {
        'Europe/Amsterdam': 'NL',
        'Europe/London': 'GB',
        'Europe/Paris': 'FR',
        'Europe/Berlin': 'DE',
        'Europe/Rome': 'IT',
        'Europe/Madrid': 'ES',
        'America/New_York': 'US',
        'America/Los_Angeles': 'US',
        'America/Chicago': 'US',
        'America/Denver': 'US',
        'Asia/Tokyo': 'JP',
        'Asia/Shanghai': 'CN',
        'Asia/Hong_Kong': 'HK',
        'Asia/Singapore': 'SG',
        'Australia/Sydney': 'AU',
        'Pacific/Auckland': 'NZ'
    };
    
    return timezoneMap[timezone] || null;
}

// Functie om specifiek NordVPN te detecteren
function detectNordVPN(ipInfo) {
    try {
        // NordVPN specifieke eigenschappen
        const userAgentLower = ipInfo.userAgent.toLowerCase();
        const vendorLower = ipInfo.vendor.toLowerCase();
        const platformLower = ipInfo.platform.toLowerCase();
        
        // NordVPN specifieke keywords
        const nordKeywords = [
            'nord', 'nordvpn', 'tefincom', 'panama', 'nordlayer', 'nordnet',
            'nordpass', 'nordlocker', 'nordaccount', 'nordsec'
        ];
        
        // Controleer op NordVPN keywords in verschillende eigenschappen
        for (const keyword of nordKeywords) {
            if (userAgentLower.includes(keyword) || 
                vendorLower.includes(keyword) || 
                platformLower.includes(keyword)) {
                return true;
            }
        }
        
        // Controleer op bekende NordVPN eigenschappen
        if (ipInfo.doNotTrack === '1' && 
            ipInfo.webdriver === false && 
            ipInfo.cookieEnabled === true) {
            // Dit is een patroon dat vaak voorkomt bij NordVPN
            const hardwareConcurrency = parseInt(ipInfo.hardwareConcurrency, 10);
            if (hardwareConcurrency >= 4 && hardwareConcurrency <= 8) {
                return true;
            }
        }
        
        return false;
    } catch (error) {
        console.error('Fout bij detecteren NordVPN:', error);
        return false;
    }
}

// Functie om specifiek Google VPN te detecteren
function isGoogleVPN(ipInfo) {
    try {
        console.log('Google VPN detectie gestart met lokale methoden...');
        
        // Google VPN-specifieke keywords
        const googleVPNKeywords = [
            'google one vpn', 'googleonevpn', 'google fi vpn', 'googlefivpn',
            'google fiber vpn', 'googlefibervpn', 'google cloud vpn', 'googlecloudvpn',
            'google', 'alphabet', 'gcp', 'google cloud platform'
        ];
        
        // Controleer op Google VPN-gerelateerde eigenschappen in de user agent
        const userAgentLower = ipInfo.userAgent.toLowerCase();
        for (const keyword of googleVPNKeywords) {
            if (userAgentLower.includes(keyword.toLowerCase())) {
                console.log(`Google VPN gedetecteerd via user agent: ${keyword}`);
                return true;
            }
        }
        
        // Controleer op Google VPN-gerelateerde eigenschappen in de vendor
        const vendorLower = ipInfo.vendor.toLowerCase();
        if (vendorLower.includes('google')) {
            console.log('Google VPN gedetecteerd via vendor');
            return true;
        }
        
        // Controleer op Google VPN-gerelateerde eigenschappen in de platform
        const platformLower = ipInfo.platform.toLowerCase();
        if (platformLower.includes('google')) {
            console.log('Google VPN gedetecteerd via platform');
            return true;
        }
        
        // Controleer op Google VPN-gerelateerde eigenschappen in de browser
        if (ipInfo.userAgent.includes('Chrome') && 
            ipInfo.vendor.includes('Google') && 
            ipInfo.doNotTrack === '1' && 
            ipInfo.webdriver === false) {
            // Dit is een patroon dat vaak voorkomt bij Google VPN
            console.log('Mogelijk Google VPN gedetecteerd via browser eigenschappen');
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('Fout bij controleren Google VPN:', error);
        return false;
    }
}

// Functie om de VPN-popup te tonen
function showVPNPopup(isGoogleVPN = false, vpnInfo = {}) {
    // Controleer of de popup al bestaat
    if (document.getElementById('vpn-popup')) {
        return;
    }
    
    // Bepaal de VPN-naam
    let vpnName = 'Onbekende VPN';
    if (vpnInfo && vpnInfo.vpnName) {
        vpnName = vpnInfo.vpnName;
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
                <h2>${vpnName} Gedetecteerd</h2>
            </div>
            <div class="vpn-popup-body">
                <p>Onze geavanceerde beveiligingssystemen hebben gedetecteerd dat u momenteel <strong>${vpnName}</strong> gebruikt om onze website te bezoeken.</p>
                <p>Voor de beste gebruikerservaring en om alle functies van onze website optimaal te kunnen gebruiken, raden wij u aan uw VPN uit te schakelen.</p>
                <div class="vpn-info-box">
                    <p><strong>Waarom detecteren wij VPN's?</strong></p>
                    <p>VPN's kunnen soms de functionaliteit van onze website beïnvloeden en worden vaak gebruikt voor frauduleuze activiteiten. Wij streven naar een veilige omgeving voor al onze gebruikers.</p>
                </div>
            </div>
            <div class="vpn-popup-buttons">
                <button id="vpn-disable-btn" class="vpn-btn vpn-primary-btn">${vpnName} Uitschakelen</button>
                <button id="vpn-continue-btn" class="vpn-btn vpn-secondary-btn">Doorgaan met ${vpnName}</button>
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
        showConfirmationMessage(`Bedankt! Schakel uw ${vpnName} uit en vernieuw de pagina voor de beste ervaring.`);
    });
    
    document.getElementById('vpn-continue-btn').addEventListener('click', () => {
        closeVPNPopup();
        
        // Toon een bevestigingsbericht
        showConfirmationMessage(`U kunt doorgaan met uw ${vpnName} ingeschakeld. Sommige functies werken mogelijk niet optimaal.`);
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
    // Controleer expliciet op Google VPN
    const isGoogleVPNDetected = isGoogleVPN(ipInfo);
    
    // Controleer op NordVPN
    const isNordVPNDetected = detectNordVPN(ipInfo);
    
    // Controleer op andere populaire VPN-diensten
    const popularVPNResult = detectPopularVPNs(ipInfo);
    
    // Als Google VPN, NordVPN of een andere VPN is gedetecteerd, moet het altijd als VPN worden gemarkeerd
    const finalIsVPN = isVPN || isGoogleVPNDetected || isNordVPNDetected || popularVPNResult.detected;
    
    // Bepaal de gedetecteerde VPN-naam
    let detectedVPNName = 'Onbekende VPN';
    if (isGoogleVPNDetected) {
        detectedVPNName = 'Google VPN';
    } else if (isNordVPNDetected) {
        detectedVPNName = 'NordVPN';
    } else if (popularVPNResult.detected) {
        detectedVPNName = popularVPNResult.vpnName;
    }
    
    // Verzamel VPN-detectie details
    let vpnDetails = '';
    if (finalIsVPN) {
        vpnDetails += `✅ **VPN Gedetecteerd: ${detectedVPNName}**\n`;
        
        if (isGoogleVPNDetected) {
            vpnDetails += '⛔ **Google VPN: GEBLOKKEERD**\n';
        } else if (isNordVPNDetected) {
            vpnDetails += '⚠️ **NordVPN: GEDETECTEERD**\n';
        } else if (popularVPNResult.detected) {
            vpnDetails += `⚠️ **${popularVPNResult.vpnName}: GEDETECTEERD**\n`;
        }
    } else {
        vpnDetails += '❌ **Geen VPN Gedetecteerd**\n';
    }
    
    // Verzamel browser en systeem informatie
    const browserDetails = `**Browser:** ${browserInfo.name}\n**Code Naam:** ${browserInfo.codeName}\n**Versie:** ${browserInfo.version}\n**User Agent:** ${browserInfo.userAgent}`;
    
    // Verzamel extra informatie die we lokaal hebben verzameld
    const extraInfo = `**Platform:** ${ipInfo.platform}\n**Vendor:** ${ipInfo.vendor}\n**Taal:** ${ipInfo.language}\n**Talen:** ${ipInfo.languages}\n**Schermresolutie:** ${ipInfo.screenResolution}\n**Kleurdiepte:** ${ipInfo.colorDepth}\n**Tijdzone:** ${ipInfo.timezone}\n**Tijdzone Offset:** ${ipInfo.timezoneOffset} minuten`;
    
    // Verzamel hardware informatie
    const hardwareInfo = `**Hardware Concurrency:** ${ipInfo.hardwareConcurrency}\n**Device Memory:** ${ipInfo.deviceMemory || 'Niet beschikbaar'}\n**Cookies Ingeschakeld:** ${ipInfo.cookieEnabled}\n**Do Not Track:** ${ipInfo.doNotTrack}`;
    
    // Verzamel verbinding informatie
    let connectionInfo = '**Verbinding:** Niet beschikbaar';
    if (ipInfo.connection && typeof ipInfo.connection === 'object') {
        connectionInfo = `**Verbinding Type:** ${ipInfo.connection.effectiveType || 'Onbekend'}\n**Downlink:** ${ipInfo.connection.downlink || 'Onbekend'} Mbps\n**RTT:** ${ipInfo.connection.rtt || 'Onbekend'} ms\n**Save Data:** ${ipInfo.connection.saveData ? 'Ja' : 'Nee'}`;
    }
    
    const embed = {
        title: isGoogleVPNDetected ? '⛔ Google VPN Gebruiker Geblokkeerd' : 
               (finalIsVPN ? `🔍 ${detectedVPNName} Gebruiker Gedetecteerd` : '🔍 Nieuwe Bezoeker Gedetecteerd'),
        color: isGoogleVPNDetected ? 15158332 : (finalIsVPN ? 16750848 : 3447003), // Rood voor Google VPN, oranje voor VPN, blauw voor geen VPN
        fields: [
            {
                name: '🔒 VPN Status',
                value: vpnDetails,
                inline: false
            },
            {
                name: '🖥️ Browser Informatie',
                value: browserDetails,
                inline: false
            },
            {
                name: '📱 Systeem Informatie',
                value: extraInfo,
                inline: false
            },
            {
                name: '🔧 Hardware Informatie',
                value: hardwareInfo,
                inline: false
            },
            {
                name: '🌐 Verbinding Informatie',
                value: connectionInfo,
                inline: false
            },
            {
                name: '⏰ Tijdstip',
                value: `**Datum/Tijd:** ${new Date().toLocaleString('nl-NL')}`,
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
        console.log('Informatie succesvol naar Discord verzonden');
    } catch (error) {
        console.error('Fout bij verzenden naar Discord:', error);
    }
}

// Functie om populaire VPN-diensten te detecteren
function detectPopularVPNs(ipInfo) {
    try {
        console.log('Detectie van populaire VPN-diensten gestart...');
        
        const userAgentLower = ipInfo.userAgent.toLowerCase();
        const vendorLower = ipInfo.vendor.toLowerCase();
        const platformLower = ipInfo.platform.toLowerCase();
        
        // Structuur voor VPN-detectie: [naam, [keywords], [extra detectiefuncties]]
        const vpnServices = [
            // ExpressVPN
            {
                name: 'ExpressVPN',
                keywords: ['express', 'expressvpn', 'lightway', 'british virgin islands'],
                detect: () => {
                    // ExpressVPN gebruikt vaak WebRTC-blokkering
                    if (ipInfo.webRTCEnabled === false) {
                        return true;
                    }
                    // ExpressVPN heeft vaak specifieke hardwareConcurrency waarden
                    if (ipInfo.hardwareConcurrency === 2 || ipInfo.hardwareConcurrency === 4) {
                        return true;
                    }
                    return false;
                }
            },
            // Surfshark
            {
                name: 'Surfshark',
                keywords: ['surfshark', 'shark', 'british virgin islands', 'cleanweb', 'noborders'],
                detect: () => {
                    // Surfshark heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.cookieEnabled === true) {
                        return true;
                    }
                    return false;
                }
            },
            // CyberGhost
            {
                name: 'CyberGhost',
                keywords: ['cyberghost', 'ghost', 'romania', 'kape', 'ghostvpn'],
                detect: () => {
                    // CyberGhost heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // Private Internet Access (PIA)
            {
                name: 'Private Internet Access',
                keywords: ['pia', 'private internet access', 'privateinternetaccess', 'kape'],
                detect: () => {
                    // PIA heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // ProtonVPN
            {
                name: 'ProtonVPN',
                keywords: ['proton', 'protonvpn', 'switzerland', 'secure core'],
                detect: () => {
                    // ProtonVPN heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // IPVanish
            {
                name: 'IPVanish',
                keywords: ['ipvanish', 'vanish', 'stackpath'],
                detect: () => {
                    // IPVanish heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // Mullvad
            {
                name: 'Mullvad',
                keywords: ['mullvad', 'sweden', 'wireguard'],
                detect: () => {
                    // Mullvad heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // TunnelBear
            {
                name: 'TunnelBear',
                keywords: ['tunnelbear', 'bear', 'mcafee'],
                detect: () => {
                    // TunnelBear heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // Windscribe
            {
                name: 'Windscribe',
                keywords: ['windscribe', 'wind', 'canada', 'robert'],
                detect: () => {
                    // Windscribe heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // HideMyAss (HMA)
            {
                name: 'HideMyAss',
                keywords: ['hidemyass', 'hma', 'avast', 'donkey'],
                detect: () => {
                    // HMA heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // VyprVPN
            {
                name: 'VyprVPN',
                keywords: ['vyprvpn', 'vypr', 'golden frog', 'chameleon'],
                detect: () => {
                    // VyprVPN heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // Hotspot Shield
            {
                name: 'Hotspot Shield',
                keywords: ['hotspot', 'hotspotshield', 'aura', 'hydra'],
                detect: () => {
                    // Hotspot Shield heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // StrongVPN
            {
                name: 'StrongVPN',
                keywords: ['strongvpn', 'strong', 'j2global'],
                detect: () => {
                    // StrongVPN heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // PureVPN
            {
                name: 'PureVPN',
                keywords: ['purevpn', 'pure', 'gaditek', 'ozone'],
                detect: () => {
                    // PureVPN heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // Ivacy
            {
                name: 'Ivacy',
                keywords: ['ivacy', 'singapore', 'pmc'],
                detect: () => {
                    // Ivacy heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // Torguard
            {
                name: 'Torguard',
                keywords: ['torguard', 'vpn.ac', 'stealth'],
                detect: () => {
                    // Torguard heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // Astrill
            {
                name: 'Astrill',
                keywords: ['astrill', 'seychelles', 'vpnutil'],
                detect: () => {
                    // Astrill heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // AirVPN
            {
                name: 'AirVPN',
                keywords: ['airvpn', 'air', 'eddie', 'italy'],
                detect: () => {
                    // AirVPN heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // PrivateVPN
            {
                name: 'PrivateVPN',
                keywords: ['privatevpn', 'sweden', 'privat'],
                detect: () => {
                    // PrivateVPN heeft vaak specifieke eigenschappen
                    if (ipInfo.doNotTrack === '1' && ipInfo.webdriver === false) {
                        return true;
                    }
                    return false;
                }
            },
            // Opera VPN
            {
                name: 'Opera VPN',
                keywords: ['opera vpn', 'operavpn', 'opera browser vpn'],
                detect: () => {
                    // Opera VPN heeft vaak specifieke eigenschappen
                    if (userAgentLower.includes('opera') && ipInfo.doNotTrack === '1') {
                        return true;
                    }
                    return false;
                }
            },
            // Brave Browser VPN
            {
                name: 'Brave VPN',
                keywords: ['brave vpn', 'bravevpn', 'brave browser vpn', 'brave firewall'],
                detect: () => {
                    // Brave VPN heeft vaak specifieke eigenschappen
                    if (userAgentLower.includes('brave') && ipInfo.doNotTrack === '1') {
                        return true;
                    }
                    return false;
                }
            }
        ];
        
        // Controleer op VPN-gerelateerde eigenschappen in de user agent, vendor en platform
        for (const vpnService of vpnServices) {
            // Controleer op keywords in user agent, vendor en platform
            for (const keyword of vpnService.keywords) {
                if (userAgentLower.includes(keyword) || 
                    vendorLower.includes(keyword) || 
                    platformLower.includes(keyword)) {
                    console.log(`${vpnService.name} gedetecteerd via keyword: ${keyword}`);
                    return { detected: true, vpnName: vpnService.name };
                }
            }
            
            // Voer specifieke detectiefunctie uit
            if (vpnService.detect && vpnService.detect()) {
                console.log(`${vpnService.name} gedetecteerd via specifieke eigenschappen`);
                return { detected: true, vpnName: vpnService.name };
            }
        }
        
        // Controleer op algemene VPN-eigenschappen die niet specifiek zijn voor een bepaalde dienst
        if (ipInfo.doNotTrack === '1' && 
            ipInfo.webdriver === false && 
            ipInfo.cookieEnabled === true &&
            ipInfo.connection && 
            ipInfo.connection.rtt > 150) {
            console.log('Onbekende VPN gedetecteerd via algemene eigenschappen');
            return { detected: true, vpnName: 'Onbekende VPN' };
        }
        
        return { detected: false, vpnName: null };
    } catch (error) {
        console.error('Fout bij detecteren populaire VPNs:', error);
        return { detected: false, vpnName: null };
    }
}

// Start tracking wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Bezoeker tracking gestart...');
        
        // Haal lokale informatie op
    const ipInfo = await getIPInfo();
        console.log('Lokale informatie opgehaald:', ipInfo);
        
        // Haal browser-informatie op
    const browserInfo = getBrowserInfo();
        console.log('Browser-informatie opgehaald:', browserInfo);
        
        // Controleer op VPN-gebruik met lokale methoden
        console.log('Controleren op VPN-gebruik met lokale methoden...');
    const vpnCheckResult = await checkVPN(ipInfo);
        console.log('VPN check resultaat:', vpnCheckResult);
        
        // Verzamel VPN-informatie
        const vpnInfo = {
            isVPN: vpnCheckResult.isVPN,
            isGoogleVPN: vpnCheckResult.isGoogleVPN || false,
            vpnName: vpnCheckResult.vpnInfo ? vpnCheckResult.vpnInfo.vpnName : null,
            ipInfo: ipInfo,
            browserInfo: browserInfo
        };
    
    // Stuur informatie naar Discord
    await sendToDiscord(ipInfo, browserInfo, vpnCheckResult.isVPN);
    
        // Toon de Google VPN-blokkade als Google VPN is gedetecteerd
    if (vpnInfo.isGoogleVPN) {
            console.log('Google VPN gedetecteerd, blokkade wordt getoond...');
            showVPNPopup(true, vpnInfo); // Toon de Google VPN-blokkade
    }
    // Anders toon de normale VPN-popup als een VPN is gedetecteerd
    else if (vpnInfo.isVPN) {
            console.log(`VPN gedetecteerd (${vpnInfo.vpnName}), popup wordt getoond...`);
            showVPNPopup(false, vpnInfo); // Toon de normale VPN-popup
        } else {
            console.log('Geen VPN gedetecteerd.');
        }
    } catch (error) {
        console.error('Fout bij bezoeker tracking:', error);
    }
}); 