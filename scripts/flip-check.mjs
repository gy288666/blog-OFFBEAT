import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/gy/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'});
try{
const page=await browser.newPage({viewport:{width:1440,height:1000}});
await page.route('**/src/world.js',r=>r.fulfill({contentType:'application/javascript',body:'export function startWorld({onReady}){queueMicrotask(onReady);return {clearThumbnails(){},addThumbnails(){},setMotion(){},dispose(){}}}'}));
await page.goto('http://127.0.0.1:5173/');await page.locator('.article-art').first().click();
const card=page.locator('.article-card').first();
assert.ok(await card.evaluate(e=>e.classList.contains('flipped')));assert.equal(await page.locator('#reader-dialog').isVisible(),false);
assert.equal(await card.locator('.card-front').evaluate(e=>e.inert),true);assert.equal(await card.locator('.card-back').evaluate(e=>e.inert),false);
await card.locator('.card-back h3').click();assert.equal(await page.locator('#reader-dialog').isVisible(),false);
await page.mouse.move(1,1);const x=await page.locator('#article-grid').evaluate(e=>e.scrollLeft);await page.waitForTimeout(3500);assert.equal(await page.locator('#article-grid').evaluate(e=>e.scrollLeft),x);
await card.locator('.card-back [data-read]').click();assert.equal(await page.locator('#reader-dialog').isVisible(),true);await page.keyboard.press('Escape');
assert.ok(await card.evaluate(e=>e.classList.contains('flipped')));
await card.locator('.card-back [data-flip]').click();assert.equal(await card.evaluate(e=>e.classList.contains('flipped')),false);assert.equal(await card.locator('.card-back').evaluate(e=>e.inert),true);
console.log('PASS: summary stays open, inert faces, back text does not navigate, autoplay pauses, explicit reading, close preserves back, return to cover.');
}finally{await browser.close()}
