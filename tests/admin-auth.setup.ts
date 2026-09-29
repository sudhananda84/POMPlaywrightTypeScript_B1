import { test as setup, expect } from '@playwright/test';

// Session file reused by tests once the config has a 'setup' project and storageState
const adminAuthFile = 'playwright/.auth/admin.json';

setup('authenticate as Admin', async ({ page }) => {
    // Login
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();

    // Wait until fully logged in so the session cookie is set
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('.oxd-userdropdown-name')).toBeVisible();

    // Save session - do NOT logout here, logout invalidates the saved session on the server
    await page.context().storageState({ path: adminAuthFile });
});
