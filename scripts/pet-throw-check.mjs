import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/gy/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'});
try{
 const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/src/world.js*',r=>r.fulfill({contentType:'application/javascript',body:'export function startWorld({onReady}){queueMicrotask(onReady);return {kick(){},pat(){},clearThumbnails(){},addThumbnails(){},setMotion(){},dispose(){}}}'}));
 await page.goto('http://127.0.0.1:5173/');await page.waitForFunction(()=>document.body.dataset.scene==='ready');
 const pet=page.locator('#pet'),stage=page.locator('#pet-action');let b=await stage.boundingBox();const originalText=await page.locator('#pet-bubble').textContent();
 await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(400,250,{steps:10});await page.waitForTimeout(140);await page.mouse.up();
 assert.equal(await pet.getAttribute('data-flight'),'flying');const released=await pet.boundingBox();await page.waitForTimeout(150);assert.ok((await pet.boundingBox()).y>released.y+8);
 await page.waitForFunction(()=>document.querySelector('#pet').dataset.flight==='rest',{},{timeout:10000});assert.ok(Number(await pet.getAttribute('data-bounces'))>=2);const rest=await pet.boundingBox();assert.ok(Math.abs(rest.y+rest.height-892)<2);assert.equal(await page.locator('#pet-bubble').textContent(),originalText);
 // A fast sideways throw preserves release velocity and rebounds off the viewport.
 b=await stage.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(550,280);await page.waitForTimeout(120);
 for(let i=1;i<=5;i++){await page.mouse.move(550+i*55,280-i*7);await page.waitForTimeout(16)}await page.mouse.up();const fling=await pet.boundingBox();await page.waitForTimeout(80);assert.ok((await pet.boundingBox()).x>fling.x+12,'momentum continues after release');
 // Re-grabbing interrupts flight immediately.
 b=await stage.boundingBox();await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();assert.equal(await pet.getAttribute('data-flight'),'rest');await page.mouse.move(450,300,{steps:5});await page.mouse.up();
 await page.locator('#motion-toggle').click();assert.equal(await pet.getAttribute('data-flight'),'rest');const frozen=await pet.boundingBox();await page.waitForTimeout(250);assert.ok(Math.abs((await pet.boundingBox()).y-frozen.y)<1);
 await page.setViewportSize({width:390,height:700});await page.waitForTimeout(100);const mobile=await pet.boundingBox();assert.ok(mobile.x>=7&&mobile.x+mobile.width<=391&&mobile.y+mobile.height<=701);assert.deepEqual(errors,[]);
 console.log('PASS: release gravity, multiple bounces and settling, sideways throw, re-grab, global pause, resize containment, no accidental pass.');
}finally{await browser.close()}
