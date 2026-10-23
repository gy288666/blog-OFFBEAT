import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,executablePath:'C:/Users/gy/AppData/Local/ms-playwright/chromium-1223/chrome-win64/chrome.exe'});
async function setup(context){const p=await context.newPage();await p.route('**/src/world.js*',r=>r.fulfill({contentType:'application/javascript',body:'export function startWorld({onReady}){queueMicrotask(onReady);return {kick(){},pat(){},clearThumbnails(){},addThumbnails(){},setMotion(){},dispose(){}}}'}));await p.goto('http://127.0.0.1:5173/');await p.waitForFunction(()=>document.body.dataset.scene==='ready');p.on('pageerror',e=>console.log(e.message));return p}
try{
const context=await browser.newContext({viewport:{width:1280,height:900},reducedMotion:'reduce'}),page=await setup(context);
const pet=page.locator('#pet'),stage=page.locator('#pet-action');const initial=await pet.boundingBox(),b=await stage.boundingBox();const text=await page.locator('#pet-bubble').textContent();
await page.mouse.move(b.x+b.width/2,b.y+b.height/2);await page.mouse.down();await page.mouse.move(350,300,{steps:15});await page.mouse.up();
await page.waitForFunction(()=>document.querySelector('#pet').getBoundingClientRect().left<600);const moved=await pet.boundingBox();assert.ok(initial.x-moved.x>300);assert.ok(initial.y-moved.y>100);assert.equal(await page.locator('#pet-bubble').textContent(),text);
await page.waitForTimeout(500);await stage.click();assert.ok((await page.locator('#pet-bubble').textContent()).includes('1 次球'));
await stage.focus();const before=await pet.boundingBox();await page.keyboard.press('Alt+ArrowLeft');await page.waitForTimeout(150);assert.ok((await pet.boundingBox()).x<before.x);
await page.setViewportSize({width:390,height:700});await page.waitForTimeout(100);const clamped=await pet.boundingBox();assert.ok(clamped.x>=7&&clamped.y>=7&&clamped.x+clamped.width<=391&&clamped.y+clamped.height<=701);
await page.locator('#pet-minimize').click();await page.locator('#pet-restore').click();assert.ok(Math.abs((await pet.boundingBox()).x-clamped.x)<2);
const mobile=await browser.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true,reducedMotion:'reduce'}),touch=await setup(mobile);const tb=await touch.locator('#pet-action').boundingBox();const cdp=await mobile.newCDPSession(touch),x=tb.x+tb.width/2,y=tb.y+tb.height/2;
await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x,y}]});for(let i=1;i<=10;i++)await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x-i*10,y:y-i*25}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await touch.waitForTimeout(150);
assert.ok((await touch.locator('#pet-action').boundingBox()).y<tb.y-150);assert.equal(await touch.evaluate(()=>scrollY),0);assert.ok(!(await touch.locator('#pet-bubble').textContent()).includes('1 次球'));await touch.locator('#pet-pat').tap();await touch.waitForFunction(()=>document.querySelector('#pet-bubble').textContent.includes('就是这里'));assert.ok((await touch.locator('#pet-bubble').textContent()).includes('就是这里'));
console.log('PASS: desktop drag, no accidental pass, normal click, keyboard move, resize boundaries, restore position, real touch drag without page scrolling, pat works.');
}finally{await browser.close()}
