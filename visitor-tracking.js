// Discord webhook URL - Rate limiting configuration
const DISCORD_WEBHOOK = 'https://discord.com/api/webhooks/1348762922960027730/KiCxIrTuv5bihTxm6-1PmuWmWdpTZWG5r2Q2IKvYkIG9f-DWv_Uq8pNhcBOYPkjnscVt';
const RATE_LIMIT_MINUTES = 5;
const RATE_LIMIT_KEY = 'lastTracking';

// Check rate limiting
function checkRateLimit() {
    const lastTracking = localStorage.getItem(RATE_LIMIT_KEY);
    const now = Date.now();
    if (lastTracking) {
        const timeDiff = now - parseInt(lastTracking);
        if (timeDiff < RATE_LIMIT_MINUTES * 60 * 1000) {
            return false;
        }
    }
    localStorage.setItem(RATE_LIMIT_KEY, now.toString());
    return true;
}

// Functie om IP informatie op te halen met retry mechanisme
async function getIPInfo() {
    try {
        // Check rate limiting before making the request
        if (!checkRateLimit()) {
            console.log('Rate limit reached, skipping tracking');
            return null;
        }

        const response = await fetch('https://ipapi.co/json/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        
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
        
        return {
            ip: data.ip || 'Niet beschikbaar',
            provider: data.org || 'Niet beschikbaar',
            hostname: data.hostname || 'Niet beschikbaar',
            socket: `${data.ip}:80` || 'Niet beschikbaar',
            country: data.country_name || 'Onbekend',
            city: data.city || 'Onbekend',
            isp: data.org || 'Onbekend',
            asn: data.asn || 'Onbekend',
            region: data.region || 'Onbekend',
            timezone: timezone,
            loc: data.latitude && data.longitude ? `${data.latitude},${data.longitude}` : 'Niet beschikbaar',
            
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
            userAgent: navigator.userAgent || 'Onbekend'
        };
    }
}

// Functie om browser-informatie op te halen
function getBrowserInfo() {
    try {
        const userAgent = navigator.userAgent;
        let browserName = 'Onbekend';
        let browserVersion = 'Onbekend';
        let codeName = 'Onbekend';
        
        // Detecteer browser
        if (userAgent.indexOf('Chrome') > -1) {
            browserName = 'Chrome';
            codeName = 'Mozilla';
            const chromeVersion = userAgent.match(/Chrome\/(\d+\.\d+\.\d+\.\d+)/);
            if (chromeVersion) {
                browserVersion = chromeVersion[1];
            }
        } else if (userAgent.indexOf('Firefox') > -1) {
            browserName = 'Firefox';
            codeName = 'Mozilla';
            const firefoxVersion = userAgent.match(/Firefox\/(\d+\.\d+)/);
            if (firefoxVersion) {
                browserVersion = firefoxVersion[1];
            }
        } else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
            browserName = 'Safari';
            codeName = 'Mozilla';
            const safariVersion = userAgent.match(/Version\/(\d+\.\d+)/);
            if (safariVersion) {
                browserVersion = safariVersion[1];
            }
        } else if (userAgent.indexOf('Edge') > -1 || userAgent.indexOf('Edg') > -1) {
            browserName = 'Edge';
            codeName = 'Mozilla';
            const edgeVersion = userAgent.match(/Edge\/(\d+\.\d+)/) || userAgent.match(/Edg\/(\d+\.\d+\.\d+\.\d+)/);
            if (edgeVersion) {
                browserVersion = edgeVersion[1];
            }
        } else if (userAgent.indexOf('Opera') > -1 || userAgent.indexOf('OPR') > -1) {
            browserName = 'Opera';
            codeName = 'Mozilla';
            const operaVersion = userAgent.match(/Opera\/(\d+\.\d+)/) || userAgent.match(/OPR\/(\d+\.\d+\.\d+\.\d+)/);
            if (operaVersion) {
                browserVersion = operaVersion[1];
            }
        }
        
        return {
            name: browserName,
            version: browserVersion,
            codeName: codeName,
            userAgent: userAgent
        };
    } catch (error) {
        console.error('Fout bij ophalen browser-informatie:', error);
        return {
            name: 'Onbekend',
            version: 'Onbekend',
            codeName: 'Onbekend',
            userAgent: 'Onbekend'
        };
    }
}

// Functie om informatie naar Discord te sturen
async function sendToDiscord(ipInfo, browserInfo) {
    try {
        // Verzamel extra informatie die we lokaal hebben verzameld
        const extraInfo = `**Platform:** ${ipInfo.platform}\n**Vendor:** ${ipInfo.vendor}\n**Taal:** ${ipInfo.language}\n**Talen:** ${ipInfo.languages}\n**Schermresolutie:** ${ipInfo.screenResolution}\n**Kleurdiepte:** ${ipInfo.colorDepth}\n**Tijdzone:** ${ipInfo.timezone}\n**Tijdzone Offset:** ${ipInfo.timezoneOffset} minuten`;
        
        // Verzamel hardware informatie
        const hardwareInfo = `**Hardware Concurrency:** ${ipInfo.hardwareConcurrency}\n**Device Memory:** ${ipInfo.deviceMemory || 'Niet beschikbaar'}\n**Cookies Ingeschakeld:** ${ipInfo.cookieEnabled}\n**Do Not Track:** ${ipInfo.doNotTrack}`;
        
        // Verzamel verbinding informatie
        let connectionInfo = '**Verbinding:** Niet beschikbaar';
        if (ipInfo.connection && typeof ipInfo.connection === 'object') {
            connectionInfo = `**Verbinding Type:** ${ipInfo.connection.effectiveType || 'Onbekend'}\n**Downlink:** ${ipInfo.connection.downlink || 'Onbekend'} Mbps\n**RTT:** ${ipInfo.connection.rtt || 'Onbekend'} ms\n**Save Data:** ${ipInfo.connection.saveData ? 'Ja' : 'Nee'}`;
        }

        // Maak een embed voor Discord
        const embed = {
            title: '🔍 Nieuwe Bezoeker Gedetecteerd',
            color: 3447003, // Blauwe kleur
            fields: [
                {
                    name: '🌐 Internet & IP Informatie',
                    value: `**IP Adres:** ${ipInfo.ip}\n**Provider:** ${ipInfo.provider}\n**Hostname:** ${ipInfo.hostname}\n**Socket:** ${ipInfo.socket}\n**Land:** ${ipInfo.country}\n**Stad:** ${ipInfo.city}\n**ISP:** ${ipInfo.isp}`,
                    inline: false
                },
                {
                    name: '🖥️ Browser Informatie',
                    value: `**Browser:** ${browserInfo.name}\n**Code Naam:** ${browserInfo.codeName}\n**Versie:** ${browserInfo.version}\n**User Agent:** ${browserInfo.userAgent}`,
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
                }
            ],
            timestamp: new Date().toISOString()
        };
        
        // Stuur de embed naar Discord
        await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                embeds: [embed]
            })
        });
        
        console.log('Bezoekersgegevens verzonden naar Discord');
    } catch (error) {
        console.error('Fout bij verzenden naar Discord:', error);
    }
}

// Start tracking wanneer de pagina geladen is
document.addEventListener('DOMContentLoaded', async () => {
    try {
        console.log('Bezoeker tracking gestart...');
        
        // Haal lokale informatie op
        const ipInfo = await getIPInfo();
        console.log('IP-informatie opgehaald:', ipInfo);
        
        // Haal browser-informatie op
        const browserInfo = getBrowserInfo();
        console.log('Browser-informatie opgehaald:', browserInfo);
        
        // Stuur informatie naar Discord
        await sendToDiscord(ipInfo, browserInfo);
    } catch (error) {
        console.error('Fout bij bezoeker tracking:', error);
    }
});