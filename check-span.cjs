const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ viewport: { width: 1920, height: 1080 } });
  const page = await context.newPage();
  await page.goto('http://localhost:4321/template-test');
  const rects = await page.evaluate(() => {
    return {
      p: document.querySelector('.home-hero_display-l1').getBoundingClientRect(),
      span: document.querySelector('.home-hero_display-l1 .fadeUp').getBoundingClientRect(),
      contain: document.querySelector('.home-hero_contain').getBoundingClientRect()
    };
  });
  console.log(JSON.stringify(rects, null, 2));
  await browser.close();
})();
