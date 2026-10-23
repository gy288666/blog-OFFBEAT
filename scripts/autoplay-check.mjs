import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/gy/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 // Isolate gallery behavior from unrelated GPU artwork.
 await page.route('**/src/world.js',route=>route.fulfill({contentType:'application/javascript',body:'export function startWorld({onReady}){queueMicrotask(onReady);return {clearThumbnails(){},addThumbnails(){},setMotion(){},dispose(){}}}'}));
 await page.goto('http://127.0.0.1:5173/');await page.locator('#article-grid').scrollIntoViewIfNeeded();await page.mouse.move(1,1);
 const left=()=>page.locator('#article-grid').evaluate(e=>e.scrollLeft);
 assert.equal(await page.locator('#article-grid').evaluate(e=>getComputedStyle(e).scrollbarWidth),'thin');
 assert.equal(await page.locator('.scroll-hint,.tilt-hint').count(),0);
 await page.waitForFunction(()=>document.querySelector('#article-grid').scrollLeft>100,{},{timeout:4200});
 await page.locator('.article-card').nth(1).hover();await page.waitForTimeout(800);const paused=await left();await page.waitForTimeout(4700);assert.ok(Math.abs(await left()-paused)<2);
 await page.mouse.move(1,1);await page.waitForFunction(x=>document.querySelector('#article-grid').scrollLeft>x+100,paused,{timeout:8000});
 await page.evaluate(()=>{const g=document.querySelector('#article-grid');g.scrollLeft=g.scrollWidth});await page.waitForTimeout(800);await page.waitForFunction(()=>document.querySelector('#article-grid').scrollLeft<100,{},{timeout:8000});
 await page.locator('#motion-toggle').click();await page.locator('#article-grid').scrollIntoViewIfNeeded();await page.mouse.move(1,1);await page.waitForTimeout(800);const stopped=await left();await page.waitForTimeout(4700);assert.ok(Math.abs(await left()-stopped)<2);
 console.log('PASS: scrollbar visible, automatic advance, hover pause, resume, end wrap, motion pause.');
}finally{await browser.close()}
