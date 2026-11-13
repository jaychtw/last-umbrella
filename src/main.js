import {createWebApp,Assets,loadSceneData,Transform,updateCameraAspectRatio,setPlayMode,setEditorMode} from 'esengine';
const {default:createModule}=await import('./runtime/esengine.js');
import {buildScene} from './scene.js';
import {pose} from './pose.js';
const $=id=>document.getElementById(id),canvas=$('canvas');
let time=0,playing=false,close=false,angle=.20,zh=navigator.language.startsWith('zh'),last=0,drawScene;
function labels(){
 document.documentElement.lang=zh?'zh-Hant':'en';$('title').textContent=zh?'最後一把傘':'The Last Umbrella';
 $('desc').textContent=zh?'雨停了。回看客人在騎樓收傘的八秒鐘。':'The rain has stopped. Rewatch eight seconds beneath the arcade.';
 $('play').textContent=playing?(zh?'暫停':'Pause'):(time>=8?(zh?'重播':'Replay'):(zh?'播放':'Play'));
 $('view').textContent=close?(zh?'街景':'Street view'):(zh?'近看雙手':'Inspect hands');$('lang').textContent=zh?'EN':'繁中';
 $('timeline').setAttribute('aria-label',zh?'回看時間':'Replay time');$('clock').textContent=time.toFixed(1)+' / 8 s';
}
$('play').onclick=()=>{if(time>=8)time=0;playing=!playing;labels()};
$('view').onclick=()=>{close=!close;labels();drawScene?.()};$('lang').onclick=()=>{zh=!zh;labels()};
$('timeline').oninput=e=>{playing=false;time=Number(e.target.value);labels();drawScene?.()};
let drag=null;canvas.onpointerdown=e=>{drag=e.clientX;canvas.setPointerCapture(e.pointerId)};
canvas.onpointermove=e=>{if(drag!==null){angle+=(drag-e.clientX)*.006;drag=e.clientX;drawScene?.()}};
canvas.onpointerup=canvas.onpointercancel=()=>drag=null;
canvas.onkeydown=e=>{if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();angle+=e.key==='ArrowLeft'?-.1:.1;drawScene?.()}};
labels();
async function boot(){
 const module=await createModule({canvas,locateFile:name=>'./runtime/'+name});
 const gl=canvas.getContext('webgl2',{alpha:false,antialias:true});
 if(!gl)throw Error('WebGL 2 required');
 const handle=module.GL.registerContext(gl,{majorVersion:2,minorVersion:0,enableExtensionsByDefault:true});
 const app=createWebApp(module,{renderSurface:{kind:'gl-context',handle},getViewportSize:()=>({width:canvas.width,height:canvas.height})});
 setEditorMode(false);setPlayMode(true);
 const {scene,names}=buildScene(), assets=app.getResource(Assets);
 const refs=await assets.preloadSceneAssets(scene);assets.resolveSceneAssetPaths(scene,refs);
 const ids=loadSceneData(app.world,scene);
 function set(name,xyz,rot){const id=ids.get(names.get(name)),v=app.world.get(id,Transform);
  if(xyz)v.position={x:xyz[0],y:xyz[1],z:xyz[2]};if(rot)v.rotation=rot;app.world.insert(id,Transform,v)}
 drawScene=()=>{
  const p=pose(time);set('Customer',[p.x,0,32]);set('Umbrella',[p.ux,p.uy,28]);set('Following hand',p.hand);
  for(let i=0;i<40;i++)set('Strap '+i,p.strap(i));
  for(let i=0;i<2;i++){const a=p.walkSwing*(i?-1:1)/2;set('Leg '+i,null,{x:Math.sin(a),y:0,z:0,w:Math.cos(a)})}
  const tx=close?p.ux:0,ty=close?p.uy+78:110,tz=close?28:0;
  const d=(close?93:360)*Math.max(1,(close?.9:1.55)/(canvas.width/canvas.height));
  const pitch=close?.21:.15,yaw=Math.max(-1.04,Math.min(1.04,angle));angle=yaw;
  set('Camera',[tx+d*Math.sin(yaw)*Math.cos(pitch),ty+d*Math.sin(pitch),tz+d*Math.cos(yaw)*Math.cos(pitch)],
   {x:-Math.sin(pitch/2)*Math.cos(yaw/2),y:Math.sin(yaw/2)*Math.cos(pitch/2),z:Math.sin(yaw/2)*Math.sin(pitch/2),w:Math.cos(yaw/2)*Math.cos(pitch/2)});
  return app.tick(1/60);
 };
 function resize(){const r=canvas.getBoundingClientRect(),d=Math.min(devicePixelRatio,1.5);canvas.width=Math.round(r.width*d);canvas.height=Math.round(r.height*d);updateCameraAspectRatio(app.world,canvas.width/canvas.height);drawScene()}
 new ResizeObserver(resize).observe(canvas);resize();
 $('loading').hidden=true;document.querySelector('fieldset').disabled=false;
 window.umbrellaQA={seek(t){playing=false;time=t;$('timeline').value=t;drawScene();labels()},get wraps(){return pose(time).wrap}};
 function frame(now){if(playing){time=Math.min(8,time+Math.min(.1,(now-last)/1000));if(time===8)playing=false;$('timeline').value=time;labels();drawScene()}last=now;requestAnimationFrame(frame)}requestAnimationFrame(frame);
}
boot().catch(e=>{$('loading').textContent='Preview could not start · '+e.message;console.error(e)});
