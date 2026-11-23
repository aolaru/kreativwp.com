const { test, expect } = require('@playwright/test');

test('own products are discoverable by the right task and clearly identified in the finder', async ({page}) => {
  await page.goto('/plugins/');
  await page.locator('.library-filter__details summary').click();
  await page.getByRole('button', {name:'Images',exact:true}).click();
  await expect(page.locator('[data-library-card]:visible').filter({hasText:'Kreativ Broken Image Finder'})).toBeVisible();
  await page.goto('/tools/plugin-finder/');
  await page.locator('#plugin-job').selectOption('broken-images');
  await page.getByRole('button',{name:'Build my plugin shortlist'}).click();
  await expect(page.locator('#plugin-finder-result')).toContainText('Kreativ Broken Image Finder');
  await expect(page.locator('#plugin-finder-result')).toContainText('Built by KreativWP');
  await page.locator('#plugin-job').selectOption('related-posts');
  await page.getByRole('button',{name:'Build my plugin shortlist'}).click();
  await expect(page.locator('#plugin-finder-result')).toContainText('Kreativ Smart Related Posts');
});

test('search ranks titles and handles multiple terms', async ({page}) => {
  await page.goto('/search/?q=broken%20images');
  await expect(page.locator('#search-status')).toContainText('result');
  await expect(page.locator('#search-results [data-search]:visible').first()).toContainText(/broken images/i);
  await page.getByLabel('Search all resources').fill('core kreativ');
  await expect(page.locator('#search-results [data-search]:visible').first()).toContainText('Kreativ Core');
});

test('product pages have usable previews and are discoverable in sitemap and social metadata', async ({page,request}) => {
  const xml = await (await request.get('/sitemap.xml')).text();
  expect(xml).toContain('https://kreativwp.com/products/kreativ-core/');
  await page.goto('/products/kreativ-core/');
  await expect(page.locator('.core-demo img')).toHaveCount(2);
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content',/kreativ-core\.png$/);
  for (const image of await page.locator('.core-demo img').all()) {
    await image.scrollIntoViewIfNeeded();
    await expect.poll(() => image.evaluate(i=>i.complete && i.naturalWidth>0)).toBe(true);
  }
  await page.goto('/themes/astra/');
  await expect(page.getByRole('link',{name:'Visit official site ↗'}).first()).toBeVisible();
});
