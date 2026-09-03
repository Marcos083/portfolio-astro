const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:4321/template-test');
  await page.waitForTimeout(2000);
  const data = await page.evaluate(() => {
    const el = document.querySelector('.home-hero_display-l1');
    const contain = document.querySelector('.home-hero_contain');
    const body = document.querySelector('.home-hero_body');
    const left = document.querySelector('.home-hero_left');
    const right = document.querySelector('.home-hero_right');
    const getRect = e => e ? JSON.parse(JSON.stringify(e.getBoundingClientRect())) : null;
    return {
      el: getRect(el),
      contain: getRect(contain),
      body: getRect(body),
      left: getRect(left),
      right: getRect(right)
    };
  });
  console.log(JSON.stringify(data, null, 2));
  await browser.close();
})();
