// snap.js
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.argv[2] || 'https://example.com';
const TARGET = process.argv[3] && process.argv[3] !== 'null' ? process.argv[3] : null;
const Y_OFFSET = Number(process.argv[4] || 0);

const SIZES = [
    // Mobile (xs: 0-599px)
    { w: 360, h: 780 },   // Small phone
    { w: 390, h: 844 },   // iPhone standard
    { w: 460, h: 900 },   // You said "perfectly fine" at this width

    // Small tablets (sm: 600-899px) - This range had issues
    { w: 600, h: 960 },   // Breakpoint boundary
    { w: 690, h: 1024 },  // You reported dots in description here
    { w: 768, h: 1024 },  // iPad portrait
    { w: 870, h: 1024 },  // Upper end of problematic range

    // Tablets/laptops (md: 900-1199px)
    { w: 900, h: 1024 },  // Breakpoint boundary
    { w: 1024, h: 768 },  // You said "fine" after fixes
    { w: 1030, h: 900 },  // You said "suddenly it's fine"

    // Laptops (lg: 1200-1535px)
    { w: 1200, h: 900 },  // Breakpoint boundary
    { w: 1280, h: 800 },  // Common laptop
    { w: 1390, h: 900 },  // You tested - "overall fine"
    { w: 1440, h: 900 },  // MacBook 16:10

    // Large displays (xl: 1536-1919px) - Had spacing issues
    { w: 1536, h: 960 },  // Breakpoint boundary
    { w: 1770, h: 1080 }, // You said "dots in middle of description"

    // Extra large (xxl: 1920px+)
    { w: 1920, h: 1080 }, // Full HD
    { w: 2200, h: 1080 }, // You tested - had issues

    // Optional: Ultrawide (if using uw breakpoint)
    { w: 2560, h: 1440 }  // 2K ultrawide
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
