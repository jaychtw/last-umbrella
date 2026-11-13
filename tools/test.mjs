import { chromium } from 'playwright-core';
import assert from 'node:assert/strict';
import {mkdirSync} from 'node:fs';
const browser=await chromium.launch({executablePath:process.env.CHROME_PATH||'/usr/bin/google-chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
mkdirSync('frames',{recursive:true});
try{
 for(const [name,width,height] of [['desktop',1200,820],['phone',390,844]]){
  const page=await browser.newPage({viewport:{width,height}});page.on('pageerror',e=>console.error(e));page.on('console',m=>{if(['error','warning'].includes(m.type()))console.log(m.text().slice(0,350))});
  await page.goto('http://localhost:4180/last-umbrella/');
  await page.waitForFunction(()=>window.umbrellaQA,{},{timeout:60000});await page.locator('#play').click();await page.waitForFunction(()=>Number(document.querySelector('#timeline').value)>.1);await page.locator('#play').click();
  for(const t of [0,4.35,8]){await page.evaluate(t=>umbrellaQA.seek(t),t);await page.waitForTimeout(400);await page.screenshot({path:'frames/'+name+'-'+t+'.png'})}
  assert.equal(await page.evaluate(()=>umbrellaQA.wraps),2);
  await page.locator('#view').click();await page.evaluate(()=>umbrellaQA.seek(4.35));await page.waitForTimeout(400);await page.screenshot({path:'frames/'+name+'-hands.png'});
  await page.locator('#lang').click();assert.equal(await page.locator('h1').innerText(),'最後一把傘');await page.close();
 }
}finally{await browser.close()}
