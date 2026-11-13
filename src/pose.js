const clamp=x=>Math.max(0,Math.min(1,x));
const ease=x=>{x=clamp(x);return x*x*(3-2*x)};
const mix=(a,b,f)=>a+(b-a)*f;
export function pose(t){
 t=Math.min(8,Math.max(0,t));const walk=ease(t/2.7),exit=ease((t-6.6)/1.4);
 const x=mix(-150,21,walk)-26*exit;
 const lift=ease((t-2.45)/.6),drop=ease((t-5.85)/.8);
 const ux=mix(x+26,50,drop),uy=mix(10+13*lift,0,drop);
 const wrap=2*ease((t-3)/2.7);
 function strap(i){
  const f=i/39,used=Math.min(f,wrap/2),a=used*4*Math.PI;
  const loose=(f-used)*26;
  return [Math.cos(a)*4.8+loose*.78,79-used*8-loose*.52,Math.sin(a)*4.8+loose*.30];
 }
 const tip=strap(39), hand=[ux+tip[0]-x,uy+tip[1]+15,tip[2]+3];
 hand[0]=mix(hand[0],25,exit);hand[1]=mix(hand[1],108,exit);
 return {x,ux,uy,hand,strap,walkSwing:Math.sin(t*6.8)*(1-ease((t-2.1)/.6))*.26,wrap};
}
