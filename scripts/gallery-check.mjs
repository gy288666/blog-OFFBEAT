import { chromium } from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/gy/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>document.body.dataset.scene==='ready');
 await page.locator('#journal').scrollIntoViewIfNeeded();
 assert.equal(await page.locator('.article-card').count(),6);
 const box=await page.locator('.article-card').first().boundingBox();
 await page.mouse.move(box.x+box.width*.8,box.y+150);await page.mouse.down();await page.mouse.move(box.x+box.width*.2,box.y+150,{steps:12});await page.mouse.up();
 assert.ok(await page.locator('#article-grid').evaluate(e=>e.scrollLeft)>50);assert.equal(await page.locator('#reader-dialog').isVisible(),false);
 await page.waitForTimeout(500);await page.locator('#gallery-next').click();assert.ok(await page.locator('#article-grid').evaluate(e=>e.scrollLeft)>200);
 await page.locator('[data-filter="代码实验"]').click();assert.equal(await page.locator('.article-card').count(),2);
 await page.locator('[data-save]').first().click();assert.equal(await page.locator('#reader-dialog').isVisible(),false);
 await page.locator('.card-title').first().click();assert.equal(await page.locator('#reader-dialog').isVisible(),false);await page.locator('.card-back [data-read]').first().click();assert.equal(await page.locator('#reader-dialog').isVisible(),true);await page.keyboard.press('Escape');
 await page.locator('#motion-toggle').click();await page.locator('.card-back [data-flip]').first().click();await page.locator('.article-art').first().click();await page.locator('.card-back [data-read]').first().click();
 await page.waitForFunction(()=>document.querySelector('#reader-dialog').open);await page.keyboard.press('Escape');
 await page.locator('#motion-toggle').click();await page.locator('[data-filter="全部文章"]').click();
 await page.locator('#article-grid').focus();await page.keyboard.press('ArrowRight');assert.ok(await page.locator('#article-grid').evaluate(e=>e.scrollLeft)>100);
 await page.screenshot({path:'.preview/gallery-desktop.png'});
 await page.setViewportSize({width:390,height:844});await page.locator('#journal').scrollIntoViewIfNeeded();assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
 await page.locator('#gallery-next').click();await page.screenshot({path:'.preview/gallery-mobile.png'});
 const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'});
 const touch=await mobile.newPage();await touch.goto('http://127.0.0.1:5173/');await touch.waitForFunction(()=>document.body.dataset.scene==='ready');
 await touch.evaluate(()=>window.scrollTo(0,document.querySelector('#article-grid').getBoundingClientRect().top+scrollY-80));
 const cdp=await mobile.newCDPSession(touch);
 const before=await touch.locator('#article-grid').evaluate(e=>e.scrollLeft);
 await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:310,y:260}]});
 for(let x=290;x>=70;x-=20){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x,y:260}]});await touch.waitForTimeout(20)}
 await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
 await touch.waitForTimeout(700);
 assert.ok(await touch.locator('#article-grid').evaluate(e=>e.scrollLeft)>before+80);
 assert.equal(await touch.locator('#reader-dialog').isVisible(),false);
 await touch.locator('[data-filter="设计灵感"]').tap();
 await touch.locator('.article-art').first().tap();assert.equal(await touch.locator('#reader-dialog').isVisible(),false);await touch.locator('.card-back [data-read]').first().tap();assert.equal(await touch.locator('#reader-dialog').isVisible(),true);
 await mobile.close();
 assert.deepEqual(errors,[]);console.log('PASS: drag without opening, navigation, filter reset, independent bookmark, tap reading, animated entry, keyboard, mobile overflow; no runtime errors.');
}finally{await browser.close()}
