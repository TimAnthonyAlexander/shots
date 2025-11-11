import { chromium } from 'playwright';

const URL = process.argv[2] || 'http://127.0.0.1:7273';
const TARGET_SELECTOR = process.argv[3] || null; // e.g. '#pricing' or '[data-test=hero]'
const Y_OFFSET = Number(process.argv[4] || 0);   // used if no selector
const OUTPUT_DIR = 'shots';

const SIZES = [
    { w: 360, h: 780 },   // small phone
    { w: 390, h: 844 },   // iPhone 15-ish
    { w: 414, h: 896 },   // large phone
    { w: 600, h: 960 },   // small tablet portrait
    { w: 768, h: 1024 },  // iPad portrait
    { w: 834, h: 1112 },  // iPad Air portrait
    { w: 1024, h: 768 },  // iPad landscape
    { w: 1280, h: 800 },  // small laptop
    { w: 1440, h: 900 },  // common laptop
    { w: 1920, h: 1080 }  // desktop
];

(async () => {
    const browser = await chromium.launch();
    for (const { w, h } of SIZES) {
        const context = await browser.newContext({ viewport: { width: w, height: h } });
        const page = await context.newPage();
        await page.goto(URL, { waitUntil: 'networkidle' });

        if (TARGET_SELECTOR) {
            const el = page.locator(TARGET_SELECTOR).first();
            await el.waitFor({ state: 'visible', timeout: 10000 });
            await el.scrollIntoViewIfNeeded();
        } else {
            await page.evaluate(y => window.scrollTo(0, y), Y_OFFSET);
        }

        await page.waitForTimeout(350);
        await page.screenshot({ path: `${OUTPUT_DIR}/shot-${w}x${h}.png` });
        await context.close();
    }
    await browser.close();
})();
