const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();

  const consoleLogs = [];
  const networkCalls = [];

  page.on('console', msg => {
    const txt = msg.text();
    if (txt.includes('[DEBUG-INVESTIGATION]') || txt.includes('[ConfigService]') || txt.includes('forkJoin')) {
      consoleLogs.push(txt);
    }
  });

  page.on('response', async response => {
    const url = response.url();
    if (url.includes('/api/source') && response.request().method() === 'GET') {
      try {
        const json = await response.json();
        networkCalls.push(`[GET ${response.status()}] /api/source => records: ${json.data ? json.data.length : 'N/A'}, total: ${json.total || 0}`);
      } catch(e) {
        networkCalls.push(`[GET ${response.status()}] /api/source => preflight/OPTIONS`);
      }
    }
    if (url.includes('/api/settings/config')) {
      networkCalls.push(`[GET ${response.status()}] /api/settings/config`);
    }
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:4200/auth/login', { waitUntil: 'networkidle0' });

  await page.type('input#identifier', 'islf_root');
  await page.type('input#password', 'ISLF#Root@2026!X9m');
  await page.click('button.p-button');
  await page.waitForNavigation({ waitUntil: 'networkidle0' });
  console.log('Logged in!');

  console.log('Navigating to sourcing...');
  await page.goto('http://localhost:4200/master/sourcing', { waitUntil: 'networkidle0' });

  // Wait up to 10 seconds for table rows to appear
  try {
    await page.waitForFunction(() => {
      const tbody = document.querySelector('.p-datatable-tbody');
      if (!tbody) return false;
      const trs = tbody.querySelectorAll('tr');
      // At least 1 row that is NOT the empty message row
      return trs.length > 0 && !document.querySelector('.p-datatable-emptymessage');
    }, { timeout: 10000 });
    console.log('Table rows detected!');
  } catch(e) {
    console.log('Timeout: no table rows appeared within 10s');
  }

  const rows = await page.evaluate(() => {
    const tbody = document.querySelector('.p-datatable-tbody');
    if (!tbody) return -1;
    return tbody.querySelectorAll('tr').length;
  });

  const emptyMsg = await page.evaluate(() => {
    const el = document.querySelector('.p-datatable-emptymessage');
    return el ? el.innerText.trim() : null;
  });

  console.log('\n=== RESULTS ===');
  console.log(`Table rows rendered: ${rows}`);
  console.log(`Empty message: ${emptyMsg || 'none (rows present)'}`);
  
  console.log('\n--- Angular DEBUG logs:');
  consoleLogs.forEach(l => console.log(' ', l));

  console.log('\n--- Network calls:');
  networkCalls.forEach(l => console.log(' ', l));

  await browser.close();
})();
