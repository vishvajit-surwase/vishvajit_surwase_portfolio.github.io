(function () {
  'use strict';

  // ==========================================
  // CONFIGURATION & CREDENTIALS
  // ==========================================
  const CONFIG = {
    BIN_ID: '6a54cafada38895dfe564f12',
    API_KEY: '$2a$10$HuGQ1M/awsPSIWhhGqVvCO0gcDSvTQpBu5yvJ/9SLEqYDm9HMvZXa',
    USE_JSONBIN: true,
    STORAGE_KEY: 'portfolio_visitor_log',
    OWNER_FLAG: 'portfolio_owner_mode',
    SESSION_FLAG: 'portfolio_visited_session'
  };

  // 1. Skip tracking if Owner Mode is ON
  if (localStorage.getItem(CONFIG.OWNER_FLAG) === 'true') {
    console.log('[Tracker] Owner Mode Enabled — Skipping visit tracking.');
    return;
  }

  // 2. Prevent double tracking same browser session
  if (sessionStorage.getItem(CONFIG.SESSION_FLAG)) {
    console.log('[Tracker] Session already logged.');
    return;
  }

  // Set session flag immediately
  sessionStorage.setItem(CONFIG.SESSION_FLAG, 'true');

  // Helper: Get Flag Emoji from Country Code
  function getFlagEmoji(countryCode) {
    if (!countryCode || countryCode.length !== 2) return '🌐';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map(char => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }

  // Helper: Detect Browser & Version
  function detectBrowser() {
    const ua = navigator.userAgent;
    if (ua.includes('Edg/')) return 'Edge';
    if (ua.includes('Chrome/')) return 'Chrome';
    if (ua.includes('Firefox/')) return 'Firefox';
    if (ua.includes('Safari/') && !ua.includes('Chrome/')) return 'Safari';
    if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
    return 'Other Browser';
  }

  // Helper: Detect OS
  function detectOS() {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    return 'Other OS';
  }

  // Helper: Detect Device Type
  function detectDevice() {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
    return isMobile ? 'Mobile' : 'Desktop';
  }

  // Helper: Detect Referrer Source
  function detectReferrer() {
    const ref = document.referrer;
    if (!ref) return 'Direct';
    if (ref.includes('google.')) return 'Google';
    if (ref.includes('linkedin.')) return 'LinkedIn';
    if (ref.includes('github.')) return 'GitHub';
    if (ref.includes('twitter.') || ref.includes('t.co') || ref.includes('x.com')) return 'Twitter/X';
    if (ref.includes('facebook.')) return 'Facebook';
    return 'Other';
  }

  // Main Tracking Execution
  async function recordVisit() {
    let geoData = {
      ip: 'Hidden',
      city: 'Unknown',
      country_name: 'Unknown',
      country_code: 'UN',
      latitude: 0,
      longitude: 0
    };

    try {
      // Fetch IP geolocation data
      const res = await fetch('https://ipapi.co/json/');
      if (res.ok) {
        const data = await res.json();
        geoData = {
          ip: data.ip || 'Hidden',
          city: data.city || 'Unknown',
          country_name: data.country_name || 'Unknown',
          country_code: data.country_code || 'UN',
          latitude: data.latitude || 0,
          longitude: data.longitude || 0
        };
      }
    } catch (_) {
      // Fallback if IP API blocked
    }

    const newVisit = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      country: geoData.country_name,
      country_code: geoData.country_code,
      flag: getFlagEmoji(geoData.country_code),
      city: geoData.city,
      ip: geoData.ip,
      lat: geoData.latitude,
      lng: geoData.longitude,
      browser: detectBrowser(),
      os: detectOS(),
      device: detectDevice(),
      referrer: detectReferrer(),
      screen: `${window.screen.width}x${window.screen.height}`,
      language: navigator.language || 'en-US',
      email: null
    };

    // 1. Save to Local Storage
    let localLogs = [];
    try {
      localLogs = JSON.parse(localStorage.getItem(CONFIG.STORAGE_KEY) || '[]');
    } catch (_) { localLogs = []; }

    localLogs.unshift(newVisit);
    // Keep max 500 records locally
    if (localLogs.length > 500) localLogs = localLogs.slice(0, 500);
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(localLogs));

    // 2. Save to Cloud (JSONBin.io) if enabled
    if (CONFIG.USE_JSONBIN && CONFIG.BIN_ID && CONFIG.API_KEY) {
      try {
        // Fetch current cloud bin data
        const binRes = await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.BIN_ID}/latest`, {
          headers: { 'X-Master-Key': CONFIG.API_KEY }
        });

        let cloudLogs = [];
        if (binRes.ok) {
          const binJson = await binRes.json();
          cloudLogs = Array.isArray(binJson.record) ? binJson.record : (binJson.record.visitors || []);
        }

        cloudLogs.unshift(newVisit);
        if (cloudLogs.length > 1000) cloudLogs = cloudLogs.slice(0, 1000);

        // Update JSONBin
        await fetch(`https://api.jsonbin.io/v3/b/${CONFIG.BIN_ID}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-Master-Key': CONFIG.API_KEY
          },
          body: JSON.stringify({ visitors: cloudLogs })
        });
      } catch (err) {
        console.warn('[Tracker] Cloud sync error:', err);
      }
    }

    console.log('[Tracker] Visit successfully logged:', newVisit.country, newVisit.city);
  }

  // Run on page load
  if (document.readyState === 'complete') {
    recordVisit();
  } else {
    window.addEventListener('load', recordVisit);
  }
})();
