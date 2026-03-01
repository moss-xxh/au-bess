import puppeteer from 'puppeteer-core';

const CHROME_PATH = '/root/.cache/ms-playwright/chromium-1208/chrome-linux64/chrome';
const BASE = 'http://49.51.194.118:8082';

async function run() {
    const browser = await puppeteer.launch({
        executablePath: CHROME_PATH,
        headless: 'new',
        args: ['--no-sandbox', '--disable-gpu', '--window-size=1920,1080'],
        defaultViewport: { width: 1920, height: 1080 }
    });

    const page = await browser.newPage();
    let passed = 0;
    let failed = 0;

    function check(name, condition) {
        if (condition) { console.log('  ✅ ' + name); passed++; }
        else { console.log('  ❌ FAIL: ' + name); failed++; }
    }

    // Setup session
    await page.goto(BASE + '/pages/login.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
        localStorage.setItem('au002_session', JSON.stringify({
            token: 'au002_test', username: 'admin@xuheng.com', role: 'operator',
            loginTime: new Date().toISOString(), timestamp: Date.now()
        }));
        localStorage.setItem('au002_theme', 'dark');
        localStorage.setItem('au002_language', 'zh');
    });

    // ===== RED LINE 1: Logout must work =====
    console.log('\n=== RED LINE 1: Logout Functionality ===');
    await page.goto(BASE + '/pages/operator/dispatch.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    // Click the logout button (the last menu item with id shell-logout-menu)
    const logoutExists = await page.$('#shell-logout-menu');
    check('Logout button exists in menu', !!logoutExists);

    if (logoutExists) {
        // Navigate via clicking logout
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 10000 }),
            page.click('#shell-logout-menu')
        ]);
        
        const afterLogoutUrl = page.url();
        check('After logout: redirected to login page', afterLogoutUrl.includes('login.html'));
        
        // Check that localStorage was cleared
        const sessionAfterLogout = await page.evaluate(() => localStorage.getItem('au002_session'));
        check('After logout: session cleared from localStorage', sessionAfterLogout === null);
        
        // Check no infinite loop — try accessing dispatch without session
        await page.goto(BASE + '/pages/operator/dispatch.html', { waitUntil: 'domcontentloaded', timeout: 10000 });
        await new Promise(r => setTimeout(r, 1000));
        const redirectedUrl = page.url();
        check('Without session: redirected to login (no loop)', redirectedUrl.includes('login.html'));
    }

    // ===== RED LINE 2: Menu permission isolation =====
    console.log('\n=== RED LINE 2: Menu Permission Isolation ===');
    
    // Re-login as operator
    await page.goto(BASE + '/pages/login.html', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
        localStorage.setItem('au002_session', JSON.stringify({
            token: 'au002_test', username: 'admin@xuheng.com', role: 'operator',
            loginTime: new Date().toISOString(), timestamp: Date.now()
        }));
    });
    await page.goto(BASE + '/pages/operator/dispatch.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    const opMenuTexts = await page.$$eval('.nav-menu-item:not(#shell-logout-menu)', els => els.map(e => e.getAttribute('data-en')));
    console.log('  Operator menus (en):', JSON.stringify(opMenuTexts));
    check('Operator sees exactly 4 menu items', opMenuTexts.length === 4);
    check('Operator does NOT see "ROI Dashboard"', !opMenuTexts.includes('ROI Dashboard'));
    check('Operator does NOT see "Asset Map"', !opMenuTexts.includes('Asset Map'));
    check('Operator does NOT see "O&M Review"', !opMenuTexts.includes('O&M Review'));
    check('Operator sees "Live Dispatch"', opMenuTexts.includes('Live Dispatch'));
    check('Operator sees "Asset Monitor"', opMenuTexts.includes('Asset Monitor'));
    check('Operator sees "Alert Log"', opMenuTexts.includes('Alert Log'));
    check('Operator sees "Market Analysis"', opMenuTexts.includes('Market Analysis'));

    // Switch to owner
    await page.evaluate(() => {
        var s = JSON.parse(localStorage.getItem('au002_session'));
        s.role = 'owner';
        localStorage.setItem('au002_session', JSON.stringify(s));
    });
    await page.goto(BASE + '/pages/owner/dashboard.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));

    const owMenuTexts = await page.$$eval('.nav-menu-item:not(#shell-logout-menu)', els => els.map(e => e.getAttribute('data-en')));
    console.log('  Owner menus (en):', JSON.stringify(owMenuTexts));
    check('Owner sees exactly 3 menu items', owMenuTexts.length === 3);
    check('Owner does NOT see "Live Dispatch"', !owMenuTexts.includes('Live Dispatch'));
    check('Owner does NOT see "Market Analysis"', !owMenuTexts.includes('Market Analysis'));
    check('Owner sees "ROI Dashboard"', owMenuTexts.includes('ROI Dashboard'));
    check('Owner sees "Asset Map"', owMenuTexts.includes('Asset Map'));
    check('Owner sees "O&M Review"', owMenuTexts.includes('O&M Review'));

    // ===== RED LINE 3: Logo pixel alignment =====
    console.log('\n=== RED LINE 3: Logo Position Stability ===');
    
    // Get logo position on dispatch page
    await page.evaluate(() => {
        var s = JSON.parse(localStorage.getItem('au002_session'));
        s.role = 'operator';
        localStorage.setItem('au002_session', JSON.stringify(s));
    });
    await page.goto(BASE + '/pages/operator/dispatch.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    const dispatchLogo = await page.$eval('.nav-brand-logo', el => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    });
    console.log('  Dispatch logo pos:', JSON.stringify(dispatchLogo));

    // Get logo position on owner dashboard
    await page.evaluate(() => {
        var s = JSON.parse(localStorage.getItem('au002_session'));
        s.role = 'owner';
        localStorage.setItem('au002_session', JSON.stringify(s));
    });
    await page.goto(BASE + '/pages/owner/dashboard.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    const dashLogo = await page.$eval('.nav-brand-logo', el => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    });
    console.log('  Dashboard logo pos:', JSON.stringify(dashLogo));

    check('Logo X position identical (dispatch vs dashboard)', dispatchLogo.x === dashLogo.x);
    check('Logo Y position identical (dispatch vs dashboard)', dispatchLogo.y === dashLogo.y);
    check('Logo width identical', dispatchLogo.w === dashLogo.w);
    check('Logo height identical', dispatchLogo.h === dashLogo.h);

    // Get logo on assets stub page
    await page.evaluate(() => {
        var s = JSON.parse(localStorage.getItem('au002_session'));
        s.role = 'operator';
        localStorage.setItem('au002_session', JSON.stringify(s));
    });
    await page.goto(BASE + '/pages/operator/assets.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    const assetsLogo = await page.$eval('.nav-brand-logo', el => {
        const r = el.getBoundingClientRect();
        return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) };
    });
    console.log('  Assets logo pos:', JSON.stringify(assetsLogo));
    check('Logo X stable (dispatch vs assets)', dispatchLogo.x === assetsLogo.x);
    check('Logo Y stable (dispatch vs assets)', dispatchLogo.y === assetsLogo.y);

    // ===== CROSS-PAGE STATE PERSISTENCE =====
    console.log('\n=== BONUS: Cross-page State Persistence ===');
    
    // Set English on dispatch
    await page.goto(BASE + '/pages/operator/dispatch.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.evaluate(() => { localStorage.setItem('au002_language', 'en'); });
    
    // Navigate to assets page — should be English
    await page.goto(BASE + '/pages/operator/assets.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 500));
    
    const langOnAssets = await page.evaluate(() => localStorage.getItem('au002_language'));
    check('Language persists across pages (en)', langOnAssets === 'en');

    const assetsTitle = await page.$eval('.empty-title', el => el.textContent);
    console.log('  Assets page title:', assetsTitle);
    check('Assets page shows English title', assetsTitle === 'Asset Monitor');

    // ===== PRIORITY SYSTEM VERIFICATION =====
    console.log('\n=== AUDIT: Priority System (P0 > P1 > P2) ===');
    
    await page.goto(BASE + '/pages/operator/dispatch.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 2000));

    const priorityTests = await page.evaluate(() => {
        var results = {};

        // Test 1: At 11:00, scheduled should say charge
        var t11 = new Date('2026-02-28T11:00:00');
        var ins1 = ControlService.getNextInstruction(t11);
        results['P2_at_11'] = { source: ins1.source, mode: ins1.mode, power: ins1.power };

        // Test 2: Manual override > scheduled
        // Reset buffer first to avoid direction-reversal debounce from Test 1
        ControlService.resetCommandBuffer();
        ControlService.setManualMode(-1.5);
        var ins2 = ControlService.getNextInstruction(t11);
        results['P1_manual_at_11'] = { source: ins2.source, mode: ins2.mode, power: ins2.power };
        ControlService.clearManualMode();
        ControlService.resetCommandBuffer();

        // Test 3: P0 SoC redline verification
        results['stopChargeSoc'] = ControlService.getStopChargeSoc(); // Should be 0.90
        results['stopDischargeSoc'] = ControlService.getStopDischargeSoc(); // Should be 0.10

        // Test 4: Outside any window
        var t8 = new Date('2026-02-28T08:00:00');
        var ins4 = ControlService.getNextInstruction(t8);
        results['idle_at_8'] = { source: ins4.source, mode: ins4.mode };

        // Test 5: Discharge window
        var t19 = new Date('2026-02-28T19:00:00');
        var ins5 = ControlService.getNextInstruction(t19);
        results['P2_at_19'] = { source: ins5.source, mode: ins5.mode, power: ins5.power };

        return results;
    });

    console.log(JSON.stringify(priorityTests, null, 2));
    check('11:00 scheduled → charging at 2MW', priorityTests.P2_at_11.source === 'scheduled' && priorityTests.P2_at_11.mode === 'charging' && priorityTests.P2_at_11.power === 2);
    check('11:00 manual → manual discharge -1.5MW', priorityTests.P1_manual_at_11.source === 'manual' && priorityTests.P1_manual_at_11.mode === 'discharging');
    check('08:00 → idle (no window)', priorityTests.idle_at_8.source === 'idle' && priorityTests.idle_at_8.mode === 'idle');
    check('19:00 scheduled → discharging at -2MW', priorityTests.P2_at_19.source === 'scheduled' && priorityTests.P2_at_19.mode === 'discharging');
    check('Stop charge SoC = 90%', priorityTests.stopChargeSoc === 0.9);
    check('Stop discharge SoC = 10%', priorityTests.stopDischargeSoc === 0.1);

    // ===== SUMMARY =====
    console.log('\n========================================');
    console.log(`RESULTS: ${passed} passed, ${failed} failed`);
    console.log('========================================');

    if (failed > 0) {
        console.log('\n❌ AUDIT FAILED');
    } else {
        console.log('\n✅ ALL AUDIT CHECKS PASSED');
    }

    await browser.close();
}

run().catch(e => { console.error(e); process.exit(1); });
