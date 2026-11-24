// Kiểm tra trang Soi chữ Hán trên WebKit (Safari) — chạy bởi .github/workflows/chu-han-webkit-test.yml
const { webkit, devices } = require('playwright');
const fs = require('fs');
const out = [];
const log = (...a) => { const s = a.join(' '); console.log(s); out.push(s); };
(async () => {
  const b = await webkit.launch();
  for (const [name, opt] of [['iphone', devices['iPhone 13']], ['ipad', devices['iPad (gen 7)']], ['mac', { viewport: { width: 1280, height: 860 } }]]) {
    const ctx = await b.newContext(opt);
    const p = await ctx.newPage();
    const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://localhost:8765/Pinyin/chu-han/?c=%E5%A5%BD', { waitUntil: 'load' });
    await p.waitForSelector('.res');
    log(name, 'hao parts:', await p.$$eval('.eq .pt', a => a.map(x => x.innerText.replace(/\n+/g, ' ')).join(' | ')));
    await p.screenshot({ path: `chu-han-${name}-1.png`, fullPage: true });
    await p.click('.stroke-b');
    await p.waitForTimeout(5000);
    log(name, 'stroke:', await p.textContent('.sc'), 'svg:', await p.$$eval('.hw svg', a => a.length));
    await p.click('.eq .pt[data-c]');
    await p.waitForTimeout(600);
    log(name, 'after tap part, url:', decodeURIComponent(p.url()), 'big:', await p.textContent('.res .big'));
    const au = []; p.on('response', r => { if (/audio\/py\//.test(r.url())) au.push(r.url().split('/').pop() + ':' + r.status()); });
    await p.fill('#q', ''); await p.type('#q', 'ma', { delay: 30 }); await p.waitForTimeout(500);
    log(name, 'suggest ma:', await p.$$eval('#sug .sr', a => a.slice(0, 6).map(x => x.innerText.replace(/\s+/g, ' ')).join(' | ')));
    await p.click('#sug .sr-say'); await p.waitForTimeout(800);
    await p.fill('#q', ''); await p.type('#q', 'hảo', { delay: 30 }); await p.waitForTimeout(500);
    log(name, 'suggest hảo:', await p.$$eval('#sug .sr', a => a.length));
    await p.click('#sug .sr-go'); await p.waitForTimeout(600);
    await p.click('.means .mini'); await p.waitForTimeout(800);
    log(name, 'audio:', au.join(' '));
    await p.fill('#q', '妈妈学汉语'); await p.click('.go'); await p.waitForTimeout(800);
    log(name, 'multi cards:', await p.$$eval('.res', a => a.length));
    await p.fill('#q', '鬱'); await p.click('.go'); await p.waitForTimeout(3000);
    log(name, 'rare:', (await p.textContent('#out')).slice(0, 80));
    await p.screenshot({ path: `chu-han-${name}-2.png`, fullPage: true });
    log(name, 'hscroll:', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth), 'errors:', JSON.stringify(errs));
    await ctx.close();
  }
  await b.close();
  fs.writeFileSync('chu-han-report.txt', out.join('\n'));
})().catch(e => { console.error(e); fs.writeFileSync('chu-han-report.txt', out.join('\n') + '\nFAIL ' + e.stack); process.exit(1); });
