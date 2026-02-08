import { chromium } from 'playwright';

(async () => {
    console.log('Starting Playwright diagnosis...');
    const browser = await chromium.launch();
    const page = await browser.newPage();

    // Listen for console logs
    page.on('console', msg => console.log(`PAGE LOG: ${msg.text()}`));

    // Listen for network errors
    page.on('response', response => {
        if (response.status() >= 400) {
            console.log(`NETWORK ERROR: ${response.request().method()} ${response.url()} -> ${response.status()} ${response.statusText()}`);
        }
    });

    try {
        console.log('Navigating to Admin Panel...');
        await page.goto('http://localhost:5173');

        // Wait for potential data loading
        console.log('Waiting for 5 seconds...');
        await page.waitForTimeout(5000);

        // Check if dropdown exists
        const dropdown = await page.$('select');
        if (dropdown) {
            console.log('Dropdown found.');
            const options = await dropdown.$$('option');
            console.log(`Found ${options.length} options in dropdown.`);
            let userFound = false;
            for (const opt of options) {
                const text = await opt.textContent();
                console.log(`Option: ${text}`);
                if (text.includes('Test Employee')) {
                    userFound = true;
                }
            }
            if (userFound) {
                console.log("✅ SUCCESS: 'Test Employee' found in dropdown.");
            } else {
                console.error("❌ FAILURE: 'Test Employee' NOT found in dropdown.");
            }
        } else {
            console.error('Dropdown NOT found.');
        }

    } catch (error) {
        console.error('Playwright Error:', error);
    } finally {
        await browser.close();
        console.log('Diagnosis complete.');
    }
})();
