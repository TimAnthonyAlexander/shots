// snap.js
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.argv[2] || 'https://example.com';
const TARGET = process.argv[3] && process.argv[3] !== 'null' ? process.argv[3] : null;
const Y_OFFSET = Number(process.argv[4] || 0);

const SIZES = [
    { w: 360, h: 780 }, { w: 390, h: 844 }, { w: 414, h: 896 },
    { w: 600, h: 960 }, { w: 768, h: 1024 }, { w: 834, h: 1112 },
    { w: 1024, h: 768 }, { w: 1280, h: 800 }, { w: 1440, h: 900 },
    { w: 1920, h: 1080 }
];

if (!fs.existsSync('shots')) fs.mkdirSync('shots');

async function scrollPage(page, target, y) {
    await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' });

    if (target) {
        console.log('Scrolling to element', target);
        await page.locator(target).first().waitFor({ state: 'visible', timeout: 15000 });
        await page.evaluate(sel => {
            const el = document.querySelector(sel);
            if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' });
        }, target);
    } else {
        console.log('Scrolling to Y offset', y);
        await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
    }

    const pos = await page.evaluate(() => window.scrollY);
    console.log('ScrollY after scroll =', pos);
    await page.waitForTimeout(800);
}

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    for (const { w, h } of SIZES) {
        console.log(`Capturing ${w}x${h}`);
        const context = await browser.newContext({
            viewport: { width: w, height: h },
            deviceScaleFactor: 1,
            isMobile: false,
            hasTouch: false
        });
        const page = await context.newPage();
        await page.goto(URL, { waitUntil: 'networkidle' });
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(500);

        await scrollPage(page, TARGET, Y_OFFSET);

        // Capture *viewport only* at the current scroll position
        const path = `shots/shot-${w}x${h}.png`;
        await page.screenshot({ path });
        console.log(`Saved ${path}`);

        await context.close();
    }
    await browser.close();
    console.log('All done.');
})();
