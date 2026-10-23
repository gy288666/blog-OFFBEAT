import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/gy/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
const page=await browser.newPage({viewport:{width:1440,height:1100}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>document.body.dataset.scene==='ready');await page.locator('#motion-toggle').click();await page.waitForTimeout(3000);
await page.screenshot({path:'.preview/site-hero.png'});
await page.evaluate(()=>window.scrollTo(0,document.querySelector('#playground').offsetTop-40));await page.waitForTimeout(1000);await page.screenshot({path:'.preview/site-lab.png'});
await page.locator('#remix').click();assert.ok((await page.locator('#spectrum-name').textContent()).includes('MINT'));assert.ok(await page.locator('#instrument-stage').isVisible());
await page.locator('#instrument-stage').click();assert.ok((await page.locator('#instrument-status').textContent()).includes('暂停'));
await page.evaluate(()=>window.scrollTo(0,document.querySelector('.closing').offsetTop));await page.waitForTimeout(700);await page.screenshot({path:'.preview/site-footer.png'});
await page.locator('.closing [data-open="about"]').click();assert.ok(await page.locator('#about-dialog').isVisible());await page.locator('#about-read').click();await page.screenshot({path:'.preview/site-reader.png'});assert.ok(await page.locator('#reader-dialog').isVisible());await page.keyboard.press('Escape');
await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(1000);await page.screenshot({path:'.preview/site-mobile-hero.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
await page.evaluate(()=>window.scrollTo(0,document.querySelector('#playground').offsetTop));await page.waitForTimeout(600);await page.screenshot({path:'.preview/site-mobile-lab.png'});
assert.deepEqual(errors,[]);console.log('PASS: real WebGL, spectrum switch stays in lab, instrument feedback, about/reader, mobile overflow; zero browser errors.');
}finally{await browser.close()}
