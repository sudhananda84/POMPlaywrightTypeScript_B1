import { test, expect } from '@playwright/test';

// OrangeHRM demo is slow; employee creation + re-login needs more than the 30s default
test.describe.configure({ timeout: 120000 });

test('TC_PIM_01 - Create employee with mandatory fields only', async ({ page }) => {
    const stamp = Date.now().toString().slice(-6);
    const firstName = 'John' + stamp;
    const lastName = 'Carter';
    const employeeId = 'P1' + stamp;

    // Login
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('.oxd-userdropdown-name')).toBeVisible();

    // Navigate to PIM > Add Employee
    await page.getByRole('link', { name: 'PIM' }).click();
    await expect(page).toHaveURL(/pim\/viewEmployeeList/);
    await page.getByRole('button', { name: 'Add' }).click();
    await expect(page).toHaveURL(/pim\/addEmployee/);

    // Employee Id is auto-generated
    const employeeIdInput = page.locator('.oxd-input-group:has(label:text-is("Employee Id")) input');
    await expect(employeeIdInput).not.toHaveValue('');

    // Fill mandatory fields (unique Id used because the demo's auto Id can already exist)
    await page.getByPlaceholder('First Name').fill(firstName);
    await page.getByPlaceholder('Last Name').fill(lastName);
    await employeeIdInput.fill(employeeId);
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify save and redirect to Personal Details
    await expect(page.locator('.oxd-toast')).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/pim\/viewPersonalDetails\/empNumber\/\d+/);
    await expect(page.getByRole('heading', { name: firstName + ' ' + lastName })).toBeVisible();

    // Verify employee in Employee List by Employee Id
    await page.getByRole('link', { name: 'PIM' }).click();
    await page.locator('.oxd-input-group:has(label:text-is("Employee Id")) input').fill(employeeId);
    await page.getByRole('button', { name: 'Search' }).click();
    const row = page.locator('.oxd-table-card').filter({ hasText: employeeId });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText(firstName);
    await expect(row).toContainText(lastName);

    // Logout
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
});

test('TC_PIM_02 - Create employee with photo and login details, then login as new user', async ({ page }) => {
    const stamp = Date.now().toString().slice(-6);
    const firstName = 'Tester' + stamp;
    const middleName = 'S';
    const lastName = 'Nair';
    const employeeId = 'P2' + stamp;
    const username = 'Tester.nair' + stamp;
    const password = 'Welcome@123';
    // 1x1 PNG, well under the 1MB limit
    const photo = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
        'base64'
    );

    // Login
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Navigate to PIM > Add Employee
    await page.getByRole('link', { name: 'PIM' }).click();
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await expect(page).toHaveURL(/pim\/addEmployee/);

    // Upload photo
    await page.locator('input[type="file"]').setInputFiles({ name: 'Tester.png', mimeType: 'image/png', buffer: photo });

    // Fill name and Employee Id
    await page.getByPlaceholder('First Name').fill(firstName);
    await page.getByPlaceholder('Middle Name').fill(middleName);
    await page.getByPlaceholder('Last Name').fill(lastName);
    await page.locator('.oxd-input-group:has(label:text-is("Employee Id")) input').fill(employeeId);

    // Enable Create Login Details and fill credentials
    await page.locator('.oxd-switch-input').click();
    await page.locator('.oxd-input-group:has(label:text-is("Username")) input').fill(username);
    await page.getByText('Enabled', { exact: true }).click();
    await page.locator('input[type="password"]').nth(0).fill(password);
    await page.locator('input[type="password"]').nth(1).fill(password);
    await page.getByRole('button', { name: 'Save' }).click();

    // Verify save
    await expect(page.locator('.oxd-toast')).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/pim\/viewPersonalDetails\/empNumber\/\d+/);
    await expect(page.getByPlaceholder('First Name')).toHaveValue(firstName);
    await expect(page.getByPlaceholder('Middle Name')).toHaveValue(middleName);
    await expect(page.getByPlaceholder('Last Name')).toHaveValue(lastName);

    // Logout Admin
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);

    // Login as the newly created ESS user
    await page.getByPlaceholder('Username').fill(username);
    await page.getByPlaceholder('Password').fill(password);
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);
    await expect(page.locator('.oxd-userdropdown-name')).toContainText(firstName);
    await expect(page.getByRole('link', { name: 'Admin' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'PIM' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'My Info' })).toBeVisible();

    // Logout new user
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);
});

test('TC_PIM_03 - Add Employee required field and length validation', async ({ page }) => {
    const stamp = Date.now().toString().slice(-6);
    const thirtyOneChars = 'Abcdefghij'.repeat(3) + 'a';

    // Login
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Navigate to PIM > Add Employee
    await page.getByRole('link', { name: 'PIM' }).click();
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await expect(page).toHaveURL(/pim\/addEmployee/);
    const employeeIdInput = page.locator('.oxd-input-group:has(label:text-is("Employee Id")) input');
    await employeeIdInput.fill('P3' + stamp);

    // Scenario A: blank First and Last Name
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.oxd-input-field-error-message', { hasText: 'Required' })).toHaveCount(2);
    await expect(page).toHaveURL(/pim\/addEmployee/);

    // Scenario B: First Name > 30 characters
    await page.getByPlaceholder('First Name').fill(thirtyOneChars);
    await page.getByPlaceholder('Last Name').fill('Test');
    await expect(page.locator('.oxd-input-field-error-message')).toHaveText(['Should not exceed 30 characters']);

    // Scenario C: Last Name > 30 characters
    await page.getByPlaceholder('First Name').fill('Mark');
    await page.getByPlaceholder('Last Name').fill(thirtyOneChars);
    await expect(page.locator('.oxd-input-field-error-message')).toHaveText(['Should not exceed 30 characters']);

    // Scenario D: Employee Id > 10 characters (unique first name so the list check below is exact)
    await page.getByPlaceholder('First Name').fill('Mark' + stamp);
    await page.getByPlaceholder('Last Name').fill('Test');
    await employeeIdInput.fill('12345678901');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.oxd-input-field-error-message')).toHaveText(['Should not exceed 10 characters']);
    await expect(page).toHaveURL(/pim\/addEmployee/);

    // Verify no employee was created (search by name: the list ignores an Employee Id filter > 10 chars)
    await page.getByRole('link', { name: 'Employee List' }).click();
    await expect(page).toHaveURL(/pim\/viewEmployeeList/);
    await expect(page.locator('.oxd-table-card').first()).toBeVisible();
    await page.locator('.oxd-input-group:has(label:text-is("Employee Name")) input').fill('Mark' + stamp);
    await page.getByRole('button', { name: 'Search' }).click();
    await expect(page.locator('.orangehrm-horizontal-padding span.oxd-text')).toHaveText('No Records Found');

    // Logout
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);
});

test('TC_PIM_04 - Duplicate Employee Id and login details validation', async ({ page }) => {
    const stamp = Date.now().toString().slice(-6);
    const existingEmployeeId = 'P4' + stamp;

    // Login
    await page.goto('https://opensource-demo.orangehrmlive.com/web/index.php/auth/login');
    await page.getByPlaceholder('Username').fill('Admin');
    await page.getByPlaceholder('Password').fill('admin123');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Precondition: create an employee whose Id will be reused
    await page.getByRole('link', { name: 'PIM' }).click();
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await page.getByPlaceholder('First Name').fill('Existing' + stamp);
    await page.getByPlaceholder('Last Name').fill('Employee');
    await page.locator('.oxd-input-group:has(label:text-is("Employee Id")) input').fill(existingEmployeeId);
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page.locator('.oxd-toast')).toContainText('Successfully Saved');
    await expect(page).toHaveURL(/pim\/viewPersonalDetails/);

    // Open Add Employee again
    await page.getByRole('link', { name: 'Add Employee' }).click();
    await expect(page).toHaveURL(/pim\/addEmployee/);
    await page.getByPlaceholder('First Name').fill('Test');
    await page.getByPlaceholder('Last Name').fill('Dup');
    const employeeIdInput = page.locator('.oxd-input-group:has(label:text-is("Employee Id")) input');

    // Scenario A: duplicate Employee Id
    await employeeIdInput.fill(existingEmployeeId);
    await expect(page.getByText('Employee Id already exists')).toBeVisible();
    await employeeIdInput.fill('P5' + stamp);
    await expect(page.getByText('Employee Id already exists')).toBeHidden();

    // Enable login details
    await page.locator('.oxd-switch-input').click();
    const usernameInput = page.locator('.oxd-input-group:has(label:text-is("Username")) input');
    const usernameGroup = page.locator('.oxd-input-group:has(label:text-is("Username"))');
    const passwordGroup = page.locator('.oxd-input-group:has(label:text-is("Password"))');
    const confirmGroup = page.locator('.oxd-input-group:has(label:text-is("Confirm Password"))');

    // Scenario B: duplicate username
    await usernameInput.fill('Admin');
    await expect(usernameGroup).toContainText('Username already exists');

    // Scenario C: username < 5 characters
    await usernameInput.fill('abc');
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(usernameGroup).toContainText('Should be at least 5 characters');

    // Scenario D: password < 7 characters
    await passwordGroup.locator('input').fill('abc12');
    await expect(passwordGroup).toContainText('Should have at least 7 characters');

    // Scenario E: password without a number
    await passwordGroup.locator('input').fill('abcdefgh');
    await expect(passwordGroup).toContainText('Your password must contain minimum 1 number');

    // Scenario F: passwords do not match
    await passwordGroup.locator('input').fill('Welcome@123');
    await confirmGroup.locator('input').fill('Welcome@124');
    await expect(confirmGroup).toContainText('Passwords do not match');

    // Save is blocked
    await page.getByRole('button', { name: 'Save' }).click();
    await expect(page).toHaveURL(/pim\/addEmployee/);

    // Logout
    await page.locator('.oxd-userdropdown-tab').click();
    await page.getByRole('menuitem', { name: 'Logout' }).click();
    await expect(page).toHaveURL(/auth\/login/);
});
