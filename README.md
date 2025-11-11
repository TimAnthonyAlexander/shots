# Shots

Automated responsive screenshots for any webpage or local dev server.  
Built with [Playwright](https://playwright.dev/) and designed to scroll to a specific point or element before capturing.

---

## Overview

**Shots** captures consistent screenshots of any webpage at multiple screen sizes (mobile → desktop).  
Useful for:
- UI showcase pages  
- Marketing material  
- Regression comparisons  
- Responsive layout testing  

---

## Features

- Scrolls to a given **Y offset** or a **target selector**  
- Captures at 10 common viewport sizes  
- Works on **local dev servers** (e.g. `http://127.0.0.1:7273`)  
- No configuration needed — one command does it all  
- Generates PNGs in the `shots/` directory  

---

## Setup

```bash
git clone https://github.com/timanthonyalexander/shots.git
cd shots
npm install
npx playwright install chromium
```

Then, ensure your `package.json` has this line near the top:

```json
"type": "module"
```

---

## Usage

### Scroll by pixel offset
```bash
node snap.js http://127.0.0.1:7273 null 2200
```
Loads the site, scrolls the window 2200 px down, and captures screenshots at all resolutions.

### Scroll to a selector
```bash
node snap.js https://ventasso.org '#pricing'
```
Scrolls until the given element is visible before taking the screenshots.

---

## Output

Screenshots are saved under the `shots/` folder:

```
shots/
├── shot-360x780.png
├── shot-1024x768.png
└── shot-1920x1080.png
```

---

## Configuration

To customize resolutions, edit the `SIZES` array inside `snap.js`:

```js
const SIZES = [
  { w: 360, h: 780 },
  { w: 1440, h: 900 },
  { w: 1920, h: 1080 }
];
```

To fine-tune scroll timing or animation settling, adjust the `waitForTimeout` delay (default: 800 ms).

---

## Example Scenarios

- Capture marketing assets in consistent layouts  
- Verify scroll-triggered animations render properly  
- Document layout breakpoints automatically  
- Generate design reference shots on deploy  

---

## License

MIT © [Tim Anthony Alexander](https://timanthonyalexander.de)
