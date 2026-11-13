// Centimetres. All dimensions denote the full extent of the built-in mesh.
export function buildScene(){
 const entities=[], names=new Map(), vec=(x,y,z)=>({x,y,z});
 function entity(name,position,scale,components=[],parent=null,rotation={x:0,y:0,z:0,w:1}){
  const id=entities.length;
  entities.push({id,name,parent,children:[],visible:true,components:[{type:'Transform',data:{position:vec(...position),scale:vec(...scale),rotation}},...components]});
  if(parent!==null)entities[parent].children.push(id);names.set(name,id);return id;
 }
 function mesh(name,kind,pos,size,color,parent=null,tilt=0){
  const n=parseInt(color,16);
  return entity(name,pos,size.map(v=>v/100),[{type:'MeshRenderer',data:{mesh:'builtin:'+kind,lit:true,opaque:true,cullBackfaces:true,color:{r:(n>>16)/255,g:((n>>8)&255)/255,b:(n&255)/255,a:1}}}],parent,{x:0,y:0,z:Math.sin(tilt/2),w:Math.cos(tilt/2)});
 }
 const box=(name,p,s,c,parent)=>mesh(name,'cube',p,s,c,parent);
 const oval=(name,p,s,c,parent)=>mesh(name,'sphere',p,s,c,parent);
 const post=(name,p,s,c,parent)=>mesh(name,'cylinder',p,s,c,parent);
 const group=(name,pos,parent=null)=>entity(name,pos,[1,1,1],[],parent);
 entity('Camera',[0,150,460],[1,1,1],[{type:'Camera',data:{projectionType:0,fov:41,nearPlane:1,farPlane:2800,isActive:true,priority:0}}]);
 entity('Rain sky',[0,0,0],[1,1,1],[{type:'Light',data:{type:2,color:{r:.54,g:.67,b:.87,a:1},intensity:.87,enabled:true}}]);
 entity('Arcade light',[0,260,150],[1,1,1],[{type:'Light',data:{type:1,color:{r:1,g:.78,b:.52,a:1},intensity:2.4,enabled:true,meshShadows:true,shadowExtent:510}}],null,{x:-.56,y:.19,z:.15,w:.79});
 box('Arcade foundation',[0,-12,0],[570,24,280],'28373b');
 for(let i=0;i<12;i++)for(let j=0;j<5;j++)box('Terrazzo tile',[i*46-252,-1,j*54-107],[45.5,3,53.5],['626b67','727a72','687976','737d76'][(i*3+j)%4]);
 for(let i=0;i<16;i++)box('Rain glint',[Math.sin(i*43)*234,1.2,65+(i*13)%60],[9+(i%5)*8,.25,1.5],'a0ada6');
 box('Plaster facade',[0,115,-108],[540,230,12],'c8aa83');
 box('Window recess',[-66,112,-98],[295,169,8],'183334');
 for(let i=0;i<4;i++){
  const x=-170+i*68;box('Tea shop window',[x,117,-92],[63,132,4],i%2?'be9867':'e0b67c');
  box('Wooden sill',[x,50,-88],[67,5,12],'724d37');
  for(let j=0;j<4;j++){const bx=x-23+j*14;box('Tea tin',[bx,82,-85],[10,19+j%2*6,5],['54645a','96674b','b09867'][j%3]);box('Tin label',[bx,83,-81],[7,6,2],'ead5a8')}
  box('Display shelf',[x,70,-84],[66,3,12],'433d36');
 }
 for(let i=0;i<12;i++)box('Roller shutter slat',[170,12+i*13,-96],[117,10,5],'65716a');
 for(const x of [-251,248]){box('Arcade column',[x,112,17],[20,224,22],'bcaa89');box('Tiled column base',[x,39,17],[23,76,25],'497771')}
 for(let i=0;i<21;i++){
  const x=-250+i*25;box('Canvas roof',[x,217,-40],[25,7,142],i%3?'42635e':'dbc595');
  box('Canvas valance',[x,207,30],[25,18,4],i%3?'42635e':'dbc595');
 }
 for(const x of [-171,140]){
  post('Lamp cord',[x,189,5],[2,42,2],'322e29');oval('Amber glass lantern',[x,166,5],[24,28,24],'ffbb69');
  for(const y of [154,160,169,178])post('Lantern binding',[x,y,5],[y===154||y===178?17:24,1.3,y===154||y===178?17:24],'9f6137');
 }
 // Open stand: the umbrella visibly enters the space between the rails.
 const standX=50;
 for(const x of [standX-14,standX+14])for(const z of [15,40])post('Brass stand leg',[x,27,z],[2.4,54,2.4],'a78b5e');
 for(const z of [15,40])box('Stand rail',[standX,51,z],[30,3,3],'c9a770');
 for(const x of [36,64])box('Stand side',[x,51,27.5],[3,3,25],'c9a770');
 box('Rain tray',[50,4,27.5],[30,4,27],'34423e');
 const actor=group('Customer',[-150,0,32]);
 const hips=group('Coat and shoulders',[0,0,0],actor);
 oval('Raincoat',[0,107,0],[46,66,32],'a25a37',hips);mesh('Flared coat','cone',[0,88,0],[53,48,39],'9c5234',hips);
 box('Scarf',[0,133,6],[38,10,28],'477d74',hips);box('Scarf end',[-9,120,17],[10,24,3],'5c9284',hips);
 oval('Face',[0,152,1],[34,42,32],'d7a37e',hips);oval('Hair',[0,164,-2],[36,23,32],'3c3029',hips);
 oval('Nose',[0,151,17],[6,7,7],'bf8968',hips);
 for(const x of [-7,7])oval('Eye',[x,156,15.3],[3,3,2],'292c29',hips);
 for(const [i,x] of [-10,10].entries()){
  const leg=group('Leg '+i,[x,81,0],actor);box('Trouser',[0,-33,0],[15,65,17],'344749',leg);oval('Shoe',[0,-74,5],[19,13,29],'473c34',leg);
 }
 oval('Left sleeve',[-24,114,1],[17,39,19],'ac6742',hips);
 const arm=group('Following hand',[0,0,0],actor);
 oval('Right sleeve',[4,0,0],[14,27,14],'a25a37',arm);oval('Fingers',[-4,-15,2],[10,11,9],'d5a17b',arm);
 const umb=group('Umbrella',[0,0,0]);
 post('Handle',[0,78,0],[4,17,4],'b78c56',umb);oval('Handle cap',[0,88,0],[6,5,6],'cf9e62',umb);
 mesh('Folded fabric','cone',[0,39,0],[18,66,18],'293c48',umb,Math.PI);
 for(let i=0;i<6;i++){const a=i*Math.PI/3;oval('Fold',[Math.cos(a)*4,43,Math.sin(a)*4],[4,47,4],'41515b',umb)}
 post('Ferrule',[0,5,0],[3,9,3],'b79a71',umb);
 // An ochre wrist strap unrolls into two coils, with its free end held by the fingertips.
 for(let i=0;i<40;i++)oval('Strap '+i,[0,0,0],[3.2,3.2,3.2],'e9b563',umb);
 return {scene:{version:4,name:'After the rain',entities},names};
}
