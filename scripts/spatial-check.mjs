import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/gy/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto('http://127.0.0.1:5173/');
 await page.waitForFunction(()=>document.body.dataset.scene==='ready');
 await page.locator('#journal').scrollIntoViewIfNeeded();
 const card=page.locator('.article-card').first();
 const b=await card.boundingBox();
 await page.mouse.move(b.x+b.width*.75,b.y+b.height*.3);
 await page.waitForFunction(()=>parseFloat(document.querySelector('.article-card').style.getPropertyValue('--ry'))>4);
 await page.mouse.move(b.x+b.width*.25,b.y+b.height*.7);
 await page.waitForFunction(()=>parseFloat(document.querySelector('.article-card').style.getPropertyValue('--ry'))< -4);
 await page.mouse.move(4,100);
 await page.waitForFunction(()=>Math.abs(parseFloat(document.querySelector('.article-card').style.getPropertyValue('--ry')))<.1);
 assert.equal(await page.locator('#starfield').count(),1);
 await page.evaluate(()=>document.querySelector('#starfield').getContext('webgl2').getExtension('WEBGL_lose_context').loseContext());
 await page.waitForFunction(()=>document.body.dataset.scene==='error');
 assert.equal(await page.locator('#starfield').count(),0);
 await page.locator('#retry-scene').click();
 await page.waitForFunction(()=>document.body.dataset.scene==='ready');
 assert.equal(await page.locator('#starfield').count(),1);
 console.log('PASS: left/right card rotation, damping reset, background loss cleanup and retry.');
} finally {await browser.close()}
