# Shots

Automated responsive screenshots for any webpage or local dev server.  
Built with [Playwright](https://playwright.dev/) and designed to scroll to a specific point or element before capturing.

---

## Overview

`shots` makes it easy to take consistent screenshots of a webpage at multiple screen sizes (mobile → desktop).  
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
