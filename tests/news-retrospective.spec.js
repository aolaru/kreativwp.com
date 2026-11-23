const { test, expect } = require('@playwright/test');

test('updates page highlights the dated retrospective and links to the milestones', async ({ page, request }) => {
  await page.goto('/news/');
  const featured = page.locator('[aria-labelledby="featured-news-title"]');
  await expect(featured).toContainText('May to November 2026');
  await expect(featured).toContainText('September 18');
  await expect(featured).toContainText('October 9');
  await expect(featured).toContainText('November 22–23');
  await expect(featured.getByRole('link', { name: /Explore Kreativ Core/ })).toHaveAttribute('href', '/products/kreativ-core/');
  await featured.getByRole('link', { name: /Read the full update/ }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('May to November 2026');
  await expect(page.getByRole('link', { name: /Browse plugin profiles/ })).toHaveAttribute('href', '/plugins/');
  const sitemap = await (await request.get('/sitemap.xml')).text();
  expect(sitemap).toContain('/news/2026-may-to-november-retrospective/');
});
