/**
 * Portfolio Visitor Tracker — vishvajit.surwase
 * ─────────────────────────────────────────────────────────────────────────────
 * SETUP (5 min, free):
 *  1. Go to https://jsonbin.io → Sign Up (free)
 *  2. Click "+ Create Bin" → paste: {"visits":[]} → Save
 *  3. Copy the Bin ID from the URL bar (after /b/)
 *  4. Go to Account → API Keys → copy your Master Key
 *  5. Paste both below and set USE_JSONBIN = true
 *
 * WITHOUT SETUP: Runs in localStorage demo mode (tracks on same machine only)
 * WITH SETUP:    Tracks ALL visitors from any device, viewable in dashboard.html
 * ─────────────────────────────────────────────────────────────────────────────
 */
(function () {

    /* ── CONFIG ──────────────────────────────────────────────── */
    const JSONBIN_BIN_ID = '6a54cafada38895dfe564f12';
    const JSONBIN_API_KEY = '$2a$10$HuGQ1M/awsPSIWhhGqVvCO0gcDSvTQpBu5yvJ/9SLEqYDm9HMvZXa';
    const USE_JSONBIN = true;
    const MAX_LOCAL_VISITS = 500;
    /* ─────────────────────────────────────────────────────────── */

    // Don't track the portfolio owner
    if (localStorage.getItem('vs_portfolio_owner') === '1') return;

    // Don't double-track within the same browser session
    if (sessionStorage.getItem('vs_tracked')) return;
    sessionStorage.setItem('vs_tracked', '1');

    /* Parse browser name from userAgent */
    function parseBrowser(ua) {
        if (/Edg\//.test(ua)) return 'Edge';
        if (/OPR\//.test(ua)) return 'Opera';
        if (/Chrome\//.test(ua)) return 'Chrome';
        if (/Firefox\//.test(ua)) return 'Firefox';
        if (/Safari\//.test(ua)) return 'Safari';
        return 'Other';
    }

    /* Parse OS from userAgent */
    function parseOS(ua) {
        if (/Windows NT 10/.test(ua)) return /Win64/.test(ua) ? 'Windows 11/10' : 'Windows 10';
        if (/Windows/.test(ua)) return 'Windows';
        if (/Mac OS X/.test(ua)) return 'macOS';
        if (/Android/.test(ua)) return 'Android';
        if (/iPhone|iPad/.test(ua)) return 'iOS';
        if (/Linux/.test(ua)) return 'Linux';
        return 'Unknown';
    }

    /* Parse referrer to human-readable source */
    function parseReferrer(ref) {
        if (!ref) return 'Direct';
        if (/google\./i.test(ref)) return 'Google';
        if (/linkedin\./i.test(ref)) return 'LinkedIn';
        if (/github\./i.test(ref)) return 'GitHub';
        if (/twitter\.|x\./i.test(ref)) return 'Twitter/X';
        try { return new URL(ref).hostname; } catch { return ref.slice(0, 40); }
    }

    /* Generate simple unique ID */
    function uid() {
        return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    async function trackVisit() {
        try {
            const ua = navigator.userAgent;
            const isMobile = /Mobi|Android/i.test(ua);

            /* Try to get IP & geo data */
            let geo = {};
            try {
                const r = await fetch('https://ipapi.co/json/');
                if (r.ok) geo = await r.json();
            } catch { /* silently skip geo if blocked */ }

            const visit = {
                id: uid(),
                timestamp: new Date().toISOString(),
                ip: geo.ip || 'Hidden',
                city: geo.city || 'Unknown',
                region: geo.region || '',
                country: geo.country_name || 'Unknown',
                country_code: geo.country_code || 'XX',
                lat: geo.latitude || null,
                lon: geo.longitude || null,
                timezone: geo.timezone || 'Unknown',
                org: geo.org || '',
                browser: parseBrowser(ua),
                os: parseOS(ua),
                device: isMobile ? 'Mobile' : 'Desktop',
                language: navigator.language || 'Unknown',
                screen: screen.width + 'x' + screen.height,
                referrer: parseReferrer(document.referrer),
                page: location.pathname,
                email: null  // Browsers never expose email — see dashboard for explanation
            };

            if (USE_JSONBIN && JSONBIN_BIN_ID !== 'YOUR_BIN_ID') {
                /* ── Production mode: JSONBin.io ── */
                const getRes = await fetch(
                    `https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}/latest`,
                    { headers: { 'X-Master-Key': JSONBIN_API_KEY } }
                );
                const data = await getRes.json();
                const visits = data.record?.visits || [];
                visits.unshift(visit);

                await fetch(`https://api.jsonbin.io/v3/b/${JSONBIN_BIN_ID}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json', 'X-Master-Key': JSONBIN_API_KEY },
                    body: JSON.stringify({ visits })
                });
            }

            /* Always save to localStorage as backup / demo mode */
            try {
                const stored = JSON.parse(localStorage.getItem('vs_visits') || '{"visits":[]}');
                stored.visits.unshift(visit);
                if (stored.visits.length > MAX_LOCAL_VISITS)
                    stored.visits = stored.visits.slice(0, MAX_LOCAL_VISITS);
                localStorage.setItem('vs_visits', JSON.stringify(stored));
            } catch { /* localStorage full */ }

        } catch { /* Silent fail — never break the portfolio */ }
    }

    // Delay tracking slightly so it doesn't compete with page paint
    setTimeout(trackVisit, 1200);

})();
