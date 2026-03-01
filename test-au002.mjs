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

    // Navigate first to set localStorage
    await page.goto(BASE + '/pages/login.html', { waitUntil: 'domcontentloaded' });
    
    // Set session for operator
    await page.evaluate(() => {
        localStorage.setItem('au002_session', JSON.stringify({
            token: 'au002_test_1709312345',
            username: 'admin@xuheng.com',
            role: 'operator',
            loginTime: new Date().toISOString(),
            timestamp: Date.now()
        }));
        localStorage.setItem('au002_theme', 'dark');
        localStorage.setItem('au002_language', 'zh');
    });

    // Test 1: Operator Dispatch
    console.log('=== Test 1: Operator Dispatch (ZH, Dark) ===');
    await page.goto(BASE + '/pages/operator/dispatch.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: '/root/projects/aus-energy/screenshots/01-dispatch-zh-dark.png', fullPage: false });
    console.log('Done: 01-dispatch-zh-dark.png');

    // Check menu items
    const menuItems = await page.$$eval('.nav-menu-item:not(#shell-logout-menu)', els => els.map(e => e.textContent.trim()));
    console.log('Operator menu items:', JSON.stringify(menuItems));
    console.log('Count:', menuItems.length, '(expect 4)');

    // Test 2: English
    console.log('\n=== Test 2: Switch English ===');
    await page.click('#shell-lang-toggle');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: '/root/projects/aus-energy/screenshots/02-dispatch-en-dark.png', fullPage: false });
    console.log('Done: 02-dispatch-en-dark.png');

    // Test 3: Full page
    console.log('\n=== Test 3: Full page ===');
    await page.screenshot({ path: '/root/projects/aus-energy/screenshots/03-dispatch-full.png', fullPage: true });

    // Test 4: Owner Dashboard
    console.log('\n=== Test 4: Owner Dashboard ===');
    await page.evaluate(() => {
        var s = JSON.parse(localStorage.getItem('au002_session'));
        s.role = 'owner';
        localStorage.setItem('au002_session', JSON.stringify(s));
        localStorage.setItem('au002_language', 'zh');
    });
    await page.goto(BASE + '/pages/owner/dashboard.html', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise(r => setTimeout(r, 3000));
    await page.screenshot({ path: '/root/projects/aus-energy/screenshots/04-owner-zh-dark.png', fullPage: false });
    console.log('Done: 04-owner-zh-dark.png');

    const ownerMenus = await page.$$eval('.nav-menu-item:not(#shell-logout-menu)', els => els.map(e => e.textContent.trim()));
    console.log('Owner menu items:', JSON.stringify(ownerMenus));
    console.log('Count:', ownerMenus.length, '(expect 3)');

    // Test 5: Owner full
    await page.screenshot({ path: '/root/projects/aus-energy/screenshots/05-owner-full.png', fullPage: true });

    // Test 6: Light theme
    console.log('\n=== Test 5: Light theme ===');
    await page.click('#shell-theme-toggle');
    await new Promise(r => setTimeout(r, 500));
    await page.screenshot({ path: '/root/projects/aus-energy/screenshots/06-owner-light.png', fullPage: false });

    // Test 7: Priority system
    console.log('\n=== Test 6: Priority Verification ===');
    const results = await page.evaluate(() => {
        // Scenario 1: scheduled charge at 11:00
        var simTime = new Date('2026-02-28T11:00:00');
        var ins = ControlService.getNextInstruction(simTime);
        var stopCharge = ControlService.getStopChargeSoc();
        
        // Scenario 2: manual override at 11:00
        ControlService.setManualMode(-1.5);
        var ins2 = ControlService.getNextInstruction(simTime);
        ControlService.clearManualMode();
        ControlService.resetCommandBuffer();

        return {
            'S1_scheduled_at_11': { source: ins.source, mode: ins.mode, power: ins.power },
            'stopChargeSoc': stopCharge,
            'S2_manual_override_at_11': { source: ins2.source, mode: ins2.mode, power: ins2.power }
        };
    });
    console.log(JSON.stringify(results, null, 2));

    await browser.close();
    console.log('\n✅ All tests complete');
}

run().catch(e => { console.error(e); process.exit(1); });
