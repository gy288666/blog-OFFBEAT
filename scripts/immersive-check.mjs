import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/gy/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text())});
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>document.body.dataset.scene==='ready',{},{timeout:60000});
 assert.equal(await page.locator('.immersive-world').count(),1);await page.screenshot({path:'.preview/immersive-hero.png'});
 const start=Number(await page.locator('#hero-art').getAttribute('data-camera'));
 await page.locator('#journal').scrollIntoViewIfNeeded();await page.waitForFunction(()=>Number(document.querySelector('#hero-art').dataset.camera)>.5);assert.ok(Number(await page.locator('#hero-art').getAttribute('data-camera'))>start);
 await page.screenshot({path:'.preview/immersive-journal.png'});
 await page.locator('.card-title').first().click();assert.equal(await page.locator('#reader-dialog').isVisible(),false);await page.locator('.card-back [data-read]').first().click();assert.ok(await page.locator('#reader-dialog').isVisible());await page.keyboard.press('Escape');
 await page.evaluate(()=>scrollTo(0,0));await page.locator('#motion-toggle').click();await page.mouse.move(800,350);await page.mouse.move(1050,550,{steps:10});await page.waitForTimeout(800);await page.locator('#motion-toggle').click();
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>scrollTo(0,0));await page.waitForTimeout(700);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await page.screenshot({path:'.preview/immersive-mobile.png'});assert.deepEqual(errors,[]);
 console.log('PASS: continuous 3D world, scroll camera with reduced motion, explicit reading after flip, live pointer rendering, mobile layout, zero browser errors.');
}finally{await browser.close()}
