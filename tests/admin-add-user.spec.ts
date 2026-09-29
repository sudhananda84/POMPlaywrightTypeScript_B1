import { test, expect } from '@playwright/test';

// OrangeHRM demo is slow; employee creation + user creation + re-login needs more than the 30s default
test.describe.configure({ timeout: 150000 });

test('TC_ADM_01 - Create system user with ESS role', async ({ page }) => {
    const stamp = Date.now().toString().slice(-6);
    const firstName = 'Ess' + stamp;
    const lastName = 'Carter';
    const username = 'john.ess' + stamp;
    const password = 'Test@1234';

    // Login
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Precondition: create the employee the user will be linked to
    await page.getByRole('link', { name: 'PIM' }).click();
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await page.getByPlaceholder('First Name').fill(firstName);
    await page.getByPlaceholder('Last Name').fill(lastName);
    await page.locator('.oxd-input-group:has(label:text-is("Employee Id")) input').fill('A1' + stamp);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.oxd-toast')).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/pim\/viewPersonalDetails/);

    // Navigate to Admin > User Management > Users > Add
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page).toHaveURL(/admin\/viewSystemUsers/);
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/admin\/saveSystemUser/);

    // User Role = ESS
    await page.locator('.oxd-input-group:has(label:text-is("User Role")) .oxd-select-text').click();
    await page.getByRole('option', { name: 'ESS' }).click();

    // Employee Name from autocomplete
    await page.getByPlaceholder('Type for hints...').fill(firstName);
    await page.getByRole('option', { name: firstName + ' ' + lastName }).click();

    // Status = Enabled
    await page.locator('.oxd-input-group:has(label:text-is("Status")) .oxd-select-text').click();
    await page.getByRole('option', { name: 'Enabled' }).click();

    // Credentials
    await page.locator('.oxd-input-group:has(label:text-is("Username")) input').fill(username);
    await page.locator('.oxd-input-group:has(label:text-is("Password")) input').fill(password);
    await page.locator('.oxd-input-group:has(label:text-is("Confirm Password")) input').fill(password);
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify save and redirect
    await expect(page.locator('.oxd-toast')).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/admin\/viewSystemUsers/);

    // Search the new user
    await page.locator('.oxd-input-group:has(label:text-is("Username")) input').fill(username);
    await page.getByRole('button', { name: 'Search' }).click();
    const row = page.locator('.oxd-table-card').filter({ hasText: username });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('ESS');
    await expect(row).toContainText(firstName);
    await expect(row).toContainText('Enabled');

    // Logout Admin
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);

    // Login as new ESS user and verify limited menu
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'My Info' })).toBeVisible();

    // Logout ESS user
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);
});

test('TC_ADM_02 - Create system user with Admin role', async ({ page }) => {
    const stamp = Date.now().toString().slice(-6);
    const firstName = 'Adm' + stamp;
    const lastName = 'Nair';
    const username = 'priya.admin' + stamp;
    const password = 'Admin@2026';

    // Login
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Precondition: create the employee the user will be linked to
    await page.getByRole('link', { name: 'PIM' }).click();
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await page.getByPlaceholder('First Name').fill(firstName);
    await page.getByPlaceholder('Last Name').fill(lastName);
    await page.locator('.oxd-input-group:has(label:text-is("Employee Id")) input').fill('A2' + stamp);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.oxd-toast')).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/pim\/viewPersonalDetails/);

    // Navigate to Admin > Add User
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/admin\/saveSystemUser/);

    // User Role = Admin
    await page.locator('.oxd-input-group:has(label:text-is("User Role")) .oxd-select-text').click();
    await page.getByRole('option', { name: 'Admin' }).click();

    // Employee Name from autocomplete
    await page.getByPlaceholder('Type for hints...').fill(firstName);
    await page.getByRole('option', { name: firstName + ' ' + lastName }).click();

    // Status = Enabled
    await page.locator('.oxd-input-group:has(label:text-is("Status")) .oxd-select-text').click();
    await page.getByRole('option', { name: 'Enabled' }).click();

    // Credentials
    await page.locator('.oxd-input-group:has(label:text-is("Username")) input').fill(username);
    await page.locator('.oxd-input-group:has(label:text-is("Password")) input').fill(password);
    await page.locator('.oxd-input-group:has(label:text-is("Confirm Password")) input').fill(password);
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify save
    await expect(page.locator('.oxd-toast')).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/admin\/viewSystemUsers/);

    // Filter by Username and User Role = Admin
    await page.locator('.oxd-input-group:has(label:text-is("Username")) input').fill(username);
    await page.locator('.oxd-input-group:has(label:text-is("User Role")) .oxd-select-text').click();
    await page.getByRole('option', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Search' }).click();
    const row = page.locator('.oxd-table-card').filter({ hasText: username });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('Admin');

    // Logout Admin
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);

    // Login as new Admin user and verify admin access
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.getByRole('link', { name: 'PIM' })).toBeVisible();
    await page.getByRole('link', { name: 'Admin' }).click();
    await expect(page).toHaveURL(/admin\/viewSystemUsers/);
    await expect(page.getByRole('heading', { name: 'System Users' })).toBeVisible();

    // Logout new Admin user
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);
});

test('TC_ADM_03 - Create system user with Disabled status and verify login is rejected', async ({ page }) => {
    const stamp = Date.now().toString().slice(-6);
    const firstName = 'Dis' + stamp;
    const lastName = 'User';
    const username = 'disabled.user' + stamp;
    const password = 'Test@5678';

    // Login
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Precondition: create the employee the user will be linked to
    await page.getByRole('link', { name: 'PIM' }).click();
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await page.getByPlaceholder('First Name').fill(firstName);
    await page.getByPlaceholder('Last Name').fill(lastName);
    await page.locator('.oxd-input-group:has(label:text-is("Employee Id")) input').fill('A3' + stamp);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.oxd-toast')).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/pim\/viewPersonalDetails/);

    // Navigate to Admin > Add User
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/admin\/saveSystemUser/);

    // User Role = ESS, Status = Disabled
    await page.locator('.oxd-input-group:has(label:text-is("User Role")) .oxd-select-text').click();
    await page.getByRole('option', { name: 'ESS' }).click();
    await page.getByPlaceholder('Type for hints...').fill(firstName);
    await page.getByRole('option', { name: firstName + ' ' + lastName }).click();
    await page.locator('.oxd-input-group:has(label:text-is("Status")) .oxd-select-text').click();
    await page.getByRole('option', { name: 'Disabled' }).click();

    // Credentials
    await page.locator('.oxd-input-group:has(label:text-is("Username")) input').fill(username);
    await page.locator('.oxd-input-group:has(label:text-is("Password")) input').fill(password);
    await page.locator('.oxd-input-group:has(label:text-is("Confirm Password")) input').fill(password);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.oxd-toast')).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/admin\/viewSystemUsers/);

    // Verify status Disabled in list
    await page.locator('.oxd-input-group:has(label:text-is("Username")) input').fill(username);
    await page.getByRole('button', { name: 'Search' }).click();
    const row = page.locator('.oxd-table-card').filter({ hasText: username });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('Disabled');

    // Logout Admin
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);

    // Attempt login as disabled user - must be rejected
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.locator('.oxd-alert-content-text')).toBeVisible();
    await expect(page).toHaveURL(/auth\/login/);

    // Login as Admin again and logout to close the session cleanly
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);
});

test('TC_ADM_04 - Add User mandatory field and data validation', async ({ page }) => {
    // Login
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Navigate to Admin > Add User
    await page.getByRole('link', { name: 'Admin' }).click();
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/admin\/saveSystemUser/);

    const roleGroup = page.locator('.oxd-input-group:has(label:text-is("User Role"))');
    const employeeGroup = page.locator('.oxd-input-group:has(label:text-is("Employee Name"))');
    const statusGroup = page.locator('.oxd-input-group:has(label:text-is("Status"))');
    const usernameGroup = page.locator('.oxd-input-group:has(label:text-is("Username"))');
    const passwordGroup = page.locator('.oxd-input-group:has(label:text-is("Password"))');
    const confirmGroup = page.locator('.oxd-input-group:has(label:text-is("Confirm Password"))');

    // Scenario A: all fields blank
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(roleGroup).toContainText('Required');
    await expect(employeeGroup).toContainText('Required');
    await expect(statusGroup).toContainText('Required');
    await expect(usernameGroup).toContainText('Required');
    await expect(passwordGroup).toContainText('Required');
    await expect(confirmGroup).toContainText('Passwords do not match');

    // Scenario B: Employee Name typed but not selected from suggestions
    await page.getByPlaceholder('Type for hints...').fill('xyz123');
    await expect(page.getByText('No Records Found')).toBeVisible();
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(employeeGroup).toContainText('Invalid');

    // Scenario C: username < 5 characters
    await usernameGroup.locator('input').fill('ab12');
    await expect(usernameGroup).toContainText('Should be at least 5 characters');

    // Scenario D: duplicate username
    await usernameGroup.locator('input').fill('Admin');
    await expect(usernameGroup).toContainText('Already exists');

    // Scenario E: password < 7 characters
    await passwordGroup.locator('input').fill('abc');
    await expect(passwordGroup).toContainText('Should have at least 7 characters');

    // Scenario F: password without a number
    await passwordGroup.locator('input').fill('abcdefgh');
    await expect(passwordGroup).toContainText('Your password must contain minimum 1 number');

    // Scenario G: passwords do not match
    await passwordGroup.locator('input').fill('Test@1234');
    await confirmGroup.locator('input').fill('Test@9999');
    await expect(confirmGroup).toContainText('Passwords do not match');

    // Save blocked, Cancel returns to list
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/admin\/saveSystemUser/);
    await page.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/admin\/viewSystemUsers/);

    // Logout
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);
});
