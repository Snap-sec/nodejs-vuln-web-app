async function authenticate({ page, target_url, scope }) {
    console.log(`[+] Starting authentication for: ${target_url}`);

    await page.goto(target_url, { waitUntil: 'networkidle' });

    console.log("[+] Performing UI-based login...");

    await page.fill('input[name="username"]', 'admin');
    await page.fill('input[name="password"]', 'admin');
    await page.click('button[type="submit"]');

    await page.waitForURL('**/dashboard', { waitUntil: 'networkidle', timeout: 5000 });

    console.log("[+] Successfully logged in and redirected to dashboard");
    console.log("[+] Authentication complete. Ready for scanning.");

    return { success: true, message: "Authentication successful" };
}

module.exports = { authenticate };
