import { test, expect } from '@playwright/test';


test("login to application", async ( { page}) => {
    await page.goto("http://localhost:5173");

    await page.getByRole("textbox").last().fill("abcd");
    await page.pause();
    

})