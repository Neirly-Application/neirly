const fetch = require('node-fetch');

async function getLocationFromIP(ip) {
    try {
        if (ip === '::1' || ip === '127.0.0.1') return 'Localhost';

        const res  = await fetch(`https://ipapi.co/${ip}/json/`);
        const data = await res.json();

        if (data.error) return 'Unknown';
        return `${data.city}, ${data.country_name}`;
    } catch (err) {
        console.error('IP LOCATION FETCH ERROR:', err.message);
        return 'Unknown';
    }
}

module.exports = getLocationFromIP;