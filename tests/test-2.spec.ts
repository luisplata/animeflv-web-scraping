import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://www3.animeflv.net/');
  await page.getByRole('link', { name: 'Watashi no Shiawase na' }).click();
  await page.getByRole('link', { name: 'Opción 1' }).click();
  await page.locator('#video_box iframe').contentFrame().locator('#video').click();
});