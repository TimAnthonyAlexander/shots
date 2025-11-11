// snap.js
import { chromium } from 'playwright';
import fs from 'fs';

const URL = process.argv[2] || 'https://example.com';
const TARGET = process.argv[3] && process.argv[3] !== 'null' ? process.argv[3] : null;
const Y_OFFSET = Number(process.argv[4] || 0);
const HEADER = process.argv[5] || null;

const SIZES = [
    { w: 360, h: 780 }, { w: 390, h: 844 }, { w: 414, h: 896 },
    { w: 600, h: 960 }, { w: 768, h: 1024 }, { w: 834, h: 1112 },
    { w: 1024, h: 768 }, { w: 1280, h: 800 }, { w: 1440, h: 900 },
    { w: 1920, h: 1080 }
];

if (!fs.existsSync('shots')) fs.mkdirSync('shots');

async function scrollToTarget(page, { target, y, header }) {
    await page.addStyleTag({ content: '*{scroll-behavior:auto!important}' });

    const headerPx = /^\d+$/.test(String(header))
        ? Number(header)
        : await page.evaluate(sel => {
            if (!sel) return 0;
            const el = document.querySelector(sel);
            if (!el) return 0;
            const r = el.getBoundingClientRect();
            return Math.ceil(r.height);
        }, header);

    if (target) {
        console.log('Scrolling to element', target);
        await page.locator(target).first().waitFor({ state: 'visible', timeout: 10000 });
        await page.evaluate(({ sel, headerPx }) => {
            const el = document.querySelector(sel);
            if (!el) return;
            const rect = el.getBoundingClientRect();
            const absoluteTop = rect.top + window.scrollY;
            window.scrollTo({ top: absoluteTop - headerPx - 8, behavior: 'instant' });
        }, { sel: target, headerPx });
    } else {
        console.log('Scrolling to Y offset', y);
        await page.evaluate(y => window.scrollTo({ top: y, behavior: 'instant' }), y);
    }

    await page.waitForTimeout(1000);
}

(async () => {
    console.log('Launching browser...');
    const browser = await chromium.launch();
    for (const { w, h } of SIZES) {
        console.log(`Capturing ${w}x${h}`);
        const context = await browser.newContext({
            viewport: { width: w, height: h },
            deviceScaleFactor: 1
        });
        const page = await context.newPage();
        await page.goto(URL, { waitUntil: 'domcontentloaded' });
        await scrollToTarget(page, { target: TARGET, y: Y_OFFSET, header: HEADER });
        const path = `shots/shot-${w}x${h}.png`;
        await page.screenshot({ path });
        console.log(`Saved ${path}`);
        await context.close();
    }
    await browser.close();
    console.log('All done.');
})();
