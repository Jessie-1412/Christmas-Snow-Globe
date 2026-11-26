import * as THREE from 'three/webgpu';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const smooth=(a:number,b:number,t:number)=>{const x=THREE.MathUtils.clamp((t-a)/(b-a),0,1);return x*x*(3-2*x);};
export function createSantaVisit(cabinScene:THREE.Group) {
  const group=new THREE.Group();group.name='Santa welcomes a visiting reindeer';
  const materials={
    red:new THREE.MeshStandardMaterial({color:0xa42b35,roughness:.72}),
    white:new THREE.MeshStandardMaterial({color:0xfff4df,roughness:.87}),
    skin:new THREE.MeshStandardMaterial({color:0xe8b294,roughness:.82}),
    dark:new THREE.MeshStandardMaterial({color:0x352b29,roughness:.76}),
    brown:new THREE.MeshStandardMaterial({color:0x88583c,roughness:.84}),
    gold:new THREE.MeshStandardMaterial({color:0xcba467,metalness:.65,roughness:.35}),
  };
  const mesh=(p:THREE.Group,g:THREE.BufferGeometry,m:THREE.Material,x=0,y=0,z=0)=>{const o=new THREE.Mesh(g,m);o.position.set(x,y,z);p.add(o);return o;};
  const ball=(p:THREE.Group,m:THREE.Material,x:number,y:number,z:number,sx:number,sy:number,sz:number)=>{const o=mesh(p,new THREE.SphereGeometry(1,16,10),m,x,y,z);o.scale.set(sx,sy,sz);return o;};
  const rod=(p:THREE.Group,m:THREE.Material,a:number[],b:number[],r:number)=>{
    const start=new THREE.Vector3(...a as [number,number,number]),end=new THREE.Vector3(...b as [number,number,number]);const delta=end.clone().sub(start);
    const o=mesh(p,new THREE.CylinderGeometry(r*.75,r,delta.length(),8),m,...start.add(end).multiplyScalar(.5).toArray() as [number,number,number]);
    o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return o;
  };
  const batch=(p:THREE.Group)=>{
    const buckets=new Map<THREE.Material,THREE.BufferGeometry[]>();
    for(const o of [...p.children])if(o instanceof THREE.Mesh){o.updateMatrix();const g=o.geometry.clone().applyMatrix4(o.matrix),m=o.material as THREE.Material;const list=buckets.get(m)||[];list.push(g);buckets.set(m,list);p.remove(o);o.geometry.dispose();}
    for(const [m,list]of buckets){p.add(new THREE.Mesh(mergeGeometries(list,false)!,m));list.forEach(g=>g.dispose());}
  };
  let groundAt=(x:number,z:number)=>{
    if(((x-.48)/.49)**2+((z-.67)/.33)**2<1)return .09;
    return .048+.017*Math.sin(x*7+z*4)+.011*Math.cos(z*11-x*3)+.06*Math.exp(-((x+.7)**2+(z+.35)**2)*3)+.012*(x*x+z*z);
  };
  const prepareGround=(scene:THREE.Group)=>{
    const surfaces:THREE.Mesh[]=[];
    const material=new THREE.MeshBasicMaterial({side:THREE.DoubleSide});
    // Keep a small CPU-only copy of the actual snow/ice after lens deformation.
    for(const child of scene.children)if(child instanceof THREE.Mesh){
      child.geometry.computeBoundingBox();const b=child.geometry.boundingBox!;
      const lowTerrain=child.geometry.type==='BufferGeometry'&&b.max.y<.25&&b.min.y>-.05;
      const ice=child.geometry.type==='SphereGeometry'&&child.scale.y<.02&&child.position.x>.3&&child.position.z>.3;
      if(lowTerrain||ice){child.updateMatrix();const g=child.geometry.clone().applyMatrix4(child.matrix);g.computeBoundingBox();g.computeBoundingSphere();surfaces.push(new THREE.Mesh(g,material));}
    }
    const cache=new Map<string,number>(),ray=new THREE.Raycaster();const fallback=groundAt;
    groundAt=(x,z)=>{
      const qx=Math.round(x*100)/100,qz=Math.round(z*100)/100,key=`${qx},${qz}`;
      const cached=cache.get(key);if(cached!==undefined)return cached;
      ray.set(new THREE.Vector3(qx,.31,qz),new THREE.Vector3(0,-1,0));
      const height=ray.intersectObjects(surfaces,false)[0]?.point.y??fallback(qx,qz);cache.set(key,height);return height;
    };
  };
  // Replace the solid cabin volume with an actual doorway, only in this variant.
  const cabin=cabinScene.children.find(o=>o instanceof THREE.Group&&Math.abs(o.position.x-.23)<.001&&Math.abs(o.position.z+.2)<.001) as THREE.Group;
  if(!cabin)throw new Error('Cabin entrance not found');
  const door=new THREE.Group();door.position.set(.23-.08,.12+.05,-.2+.417);group.add(door);
  const pieces=[...cabin.children].filter(o=>o instanceof THREE.Mesh) as THREE.Mesh[];
  const solid=pieces.find(o=>o.geometry.type==='BoxGeometry'&&Math.abs((o.geometry as THREE.BoxGeometry).parameters.width-.89)<.001)!;
  const wood=solid.material as THREE.Material;cabin.remove(solid);solid.geometry.dispose();
  mesh(cabin,new THREE.BoxGeometry(.365,.63,.76),wood,-.2625,.34,0);
  mesh(cabin,new THREE.BoxGeometry(.295,.63,.76),wood,.2975,.34,0);
  mesh(cabin,new THREE.BoxGeometry(.23,.18,.76),wood,.035,.565,0);
  mesh(cabin,new THREE.BoxGeometry(.23,.03,.76),wood,.035,.055,0);
  mesh(cabin,new THREE.BoxGeometry(.23,.44,.015),materials.dark,.035,.235,-.30);
  for(const o of pieces){
    const {x,y,z}=o.position;
    if(o.geometry.type==='BoxGeometry'&&[.48,.5].some(w=>Math.abs((o.geometry as THREE.BoxGeometry).parameters.width-w)<.001)&&z>=.44&&z<=.64){cabin.remove(o);o.geometry.dispose();continue;}
    if(Math.abs(z-.384)<.001&&x>-.08&&x<.15){cabin.remove(o);o.geometry.dispose();continue;}
    const frame=o.geometry.type==='BoxGeometry'&&Math.abs(x-.035)<.001&&Math.abs(z-.395)<.001;
    if(frame){cabin.remove(o);o.geometry.dispose();continue;}
    if((Math.abs(x-.035)<.001&&Math.abs(z-.417)<.001)||
       (Math.abs(x-.105)<.001&&Math.abs(z-.439)<.001)||
       (z>=.437&&z<=.472&&x>=-.02&&x<=.09&&y>.38&&y<.51)){
      cabin.remove(o);o.position.sub(new THREE.Vector3(-.08,.015,.417));
      if(z>=.437&&y>.38)o.position.y-=.035;
      door.add(o);
    }
  }
  for(const x of [-.095,.165])mesh(cabin,new THREE.BoxGeometry(.025,.46,.035),wood,x,.235,.405);
  mesh(cabin,new THREE.BoxGeometry(.285,.025,.035),wood,.035,.46,.405);
  // Three distinct, level treads aligned with the doorway's interior floor.
  for(const [z,top]of [[.28,.19],[.38,.15],[.48,.11]]){
    mesh(cabin,new THREE.BoxGeometry(.44,top-.06,.14),wood,0,(top+.06)/2-.12,z+.2);
    mesh(cabin,new THREE.BoxGeometry(.45,.012,.145),materials.white,0,top-.006-.12,z+.2);
  }
  cabin.traverse(o=>{o.userData.skipWaterLens=true;});
  batch(door);
  // Fully articulated standing Santa, scaled to fit through the doorway.
  const santaScale=.62,deerScale=.72;
  const santa=new THREE.Group();santa.scale.setScalar(santaScale);group.add(santa);
  ball(santa,materials.red,0,.26,0,.12,.145,.09);
  ball(santa,materials.dark,0,.215,0,.122,.024,.093);
  mesh(santa,new THREE.BoxGeometry(.035,.03,.014),materials.gold,0,.215,.096);
  const collar=mesh(santa,new THREE.TorusGeometry(.078,.014,7,24),materials.white,0,.365,0);collar.rotation.x=Math.PI/2;
  ball(santa,materials.skin,0,.43,.005,.078,.085,.07);
  for(const side of [-1,1]){
    ball(santa,materials.dark,side*.027,.45,.069,.006,.008,.005);
    ball(santa,materials.white,side*.035,.396,.063,.04,.06,.03);
  }
  ball(santa,materials.skin,0,.425,.084,.020,.018,.022);
  ball(santa,materials.white,0,.374,.073,.045,.051,.025);
  const hat=mesh(santa,new THREE.ConeGeometry(.085,.15,16),materials.red,-.012,.54,0);hat.rotation.z=.27;
  const brim=mesh(santa,new THREE.TorusGeometry(.076,.017,7,24),materials.white,0,.48,0);brim.rotation.x=Math.PI/2;
  ball(santa,materials.white,-.034,.616,0,.027,.027,.027);
  const arms:THREE.Group[]=[];
  const legs:{upper:THREE.Group;lower:THREE.Group;boot:THREE.Group;side:number}[]=[];
  for(const side of [-1,1]){
    const arm=new THREE.Group();arm.position.set(side*.105,.33,0);santa.add(arm);arms.push(arm);
    rod(arm,materials.red,[0,0,0],[side*.015,-.17,0],.033);
    ball(arm,materials.white,side*.015,-.17,0,.035,.022,.034);
    ball(arm,materials.red,side*.015,-.205,.005,.032,.032,.031);
    const upper=new THREE.Group(),lower=new THREE.Group(),boot=new THREE.Group();santa.add(upper,lower,boot);
    rod(upper,materials.red,[0,0,0],[0,-.075,0],.036);
    rod(lower,materials.red,[0,0,0],[0,-.075,0],.032);
    ball(boot,materials.dark,0,.025,.012,.041,.025,.055);
    legs.push({upper,lower,boot,side});batch(arm);batch(upper);batch(lower);batch(boot);
  }
  batch(santa);
  // One visiting reindeer: jointed legs and a head that can lean into the pat.
  const deer=new THREE.Group();deer.scale.setScalar(deerScale);deer.rotation.y=Math.PI;group.add(deer);
  ball(deer,materials.brown,0,.235,0,.18,.09,.075);
  ball(deer,materials.white,-.185,.265,0,.04,.025,.034);
  const neck=new THREE.Group();neck.position.set(.13,.25,0);deer.add(neck);
  const n=ball(neck,materials.brown,.015,.07,0,.06,.115,.055);n.rotation.z=-.30;
  ball(neck,materials.white,.062,.055,0,.024,.060,.05);
  ball(neck,materials.brown,.066,.165,0,.072,.06,.05);
  ball(neck,materials.brown,.121,.145,0,.058,.033,.039);
  ball(neck,materials.dark,.172,.145,0,.016,.020,.025);
  for(const side of [-1,1]){
    ball(neck,materials.dark,.10,.185,side*.046,.006,.007,.004);
    const ear=ball(neck,materials.brown,.025,.205,side*.072,.04,.013,.023);ear.rotation.z=-.2;
    rod(neck,materials.brown,[.035,.21,side*.031],[0,.33,side*.065],.010);
    rod(neck,materials.brown,[0,.33,side*.065],[.045,.39,side*.08],.005);
    rod(neck,materials.brown,[.015,.28,side*.05],[.075,.325,side*.07],.005);
    rod(neck,materials.brown,[.005,.32,side*.06],[-.045,.36,side*.08],.005);
  }
  const deerLegs:{upper:THREE.Group;lower:THREE.Group;hoof:THREE.Group;x:number;z:number}[]=[];
  for(const x of [-.115,.115])for(const z of [-.049,.049]){
    const upper=new THREE.Group(),lower=new THREE.Group(),hoof=new THREE.Group();deer.add(upper,lower,hoof);
    rod(upper,materials.brown,[0,0,0],[0,-.118,0],.016);
    rod(lower,materials.brown,[0,0,0],[0,-.112,0],.011);
    ball(hoof,materials.dark,0,.014,0,.025,.014,.021);
    deerLegs.push({upper,lower,hoof,x,z});batch(upper);batch(lower);batch(hoof);
  }
  const harness=mesh(deer,new THREE.TorusGeometry(.077,.007,6,24),materials.gold,.06,.235,0);harness.rotation.y=Math.PI/2;harness.scale.y=1.2;
  ball(deer,materials.gold,.06,.16,.05,.014,.014,.014);
  batch(neck);batch(deer);
  const route=new THREE.CatmullRomCurve3([
    new THREE.Vector3(.85,0,-.78),new THREE.Vector3(1.18,0,-.42),
    new THREE.Vector3(1.20,0,.24),new THREE.Vector3(1.02,0,.66),
    new THREE.Vector3(.78,0,.80),new THREE.Vector3(.565,0,.72),
  ],false,'centripetal');
  const routeLength=route.getLength();
  const angleLerp=(a:number,b:number,u:number)=>a+Math.atan2(Math.sin(b-a),Math.cos(b-a))*u;
  const routeYaw=(u:number,reverse=false)=>{const d=route.getTangentAt(THREE.MathUtils.clamp(u,0,1));return Math.atan2(-d.z,d.x)+(reverse?Math.PI:0);};
  const stairAt=(x:number,z:number)=>z<=.35?.19:z<=.45?.15:z<=.55?.11:groundAt(x,z);
  const feetAt=(t:number,start:number,end:number,reverse:boolean)=>{
    const targets=reverse?[.62,.54,.46,.38,.30,.23,.13,.13,.13]:[.23,.30,.38,.46,.54,.62,.68,.68,.68];
    const u=THREE.MathUtils.clamp((t-start)/(end-start),0,1)*targets.length;
    const index=Math.min(targets.length-1,Math.floor(u)),fraction=u>=targets.length?1:u-index;
    const z=[reverse?.68:.13,reverse?.68:.13];
    for(let i=0;i<index;i++)z[i%2]=targets[i];
    return z.map((value,i)=>{
      const base=stairAt(.265+legs[i].side*.055*santaScale,value);
      if(i!==index%2)return {z:value,y:base,base};
      const q=smooth(0,1,fraction),target=targets[index],next=stairAt(.265+legs[i].side*.055*santaScale,target);
      return {z:THREE.MathUtils.lerp(value,target,q),y:THREE.MathUtils.lerp(base,next,q)+Math.sin(fraction*Math.PI)*.065,base:THREE.MathUtils.lerp(base,next,q)};
    });
  };
  // Two-bone IK keeps boot/hoof soles level on the treads and the actual snow/ice.
  const knee=(dx:number,dy:number,a:number,b:number,bend:number)=>{
    const distance=THREE.MathUtils.clamp(Math.hypot(dx,dy),Math.abs(a-b)+.00001,a+b-.00001),d=Math.max(.00001,Math.hypot(dx,dy));
    const along=(a*a-b*b+distance*distance)/(2*distance),height=Math.sqrt(Math.max(0,a*a-along*along));
    return {x:dx/d*along-dy/d*height*bend,y:dy/d*along+dx/d*height*bend};
  };
  let time=0,stage='quiet',running=false;
  const update=(_dt:number,elapsed:number)=>{
    time=((elapsed%30)+30)%30;const t=time;
    const returning=t>=24,walking=(t>=1.5&&t<6.8)||(t>=24&&t<28.5);
    const feet=feetAt(t,returning?24:1.5,returning?28.5:6.8,returning);
    santa.visible=t>=1.5&&t<28.5;
    santa.position.set(.265,(feet[0].base+feet[1].base)/2-Math.abs(feet[0].base-feet[1].base)*.12,(feet[0].z+feet[1].z)/2);
    santa.rotation.y=returning?Math.PI:(Math.PI/2)*smooth(6.8,7.6,t)+(Math.PI/2)*smooth(23,24,t);
    const stride=walking?Math.sin((t-(returning?24:1.5))*Math.PI*9/(returning?4.5:5.3))*.22:0;
    arms[0].rotation.x=-stride;arms[1].rotation.x=stride;
    for(let i=0;i<legs.length;i++){
      const leg=legs[i],localZ=walking?(feet[i].z-santa.position.z)*Math.cos(santa.rotation.y)/santaScale:0;
      const wx=santa.position.x+leg.side*.055*santaScale*Math.cos(santa.rotation.y);
      const wz=santa.position.z-leg.side*.055*santaScale*Math.sin(santa.rotation.y);
      const soleY=walking?feet[i].y:((t<6.8||returning)? .19:groundAt(wx,wz));
      const localY=(soleY-santa.position.y)/santaScale;
      const targetY=localY+.025,k=knee(localZ,targetY-.14,.075,.075,-1);
      leg.upper.position.set(leg.side*.055,.14,0);leg.upper.rotation.x=Math.atan2(-k.x,-k.y);
      leg.lower.position.set(leg.side*.055,.14+k.y,k.x);leg.lower.rotation.x=Math.atan2(-(localZ-k.x),-(targetY-.14-k.y));
      leg.boot.position.set(leg.side*.055,localY,localZ);
    }
    const doorOpen=smooth(.5,1.5,t)*(1-smooth(5.6,6.6,t))+smooth(23,24,t)*(1-smooth(28.5,29.3,t));
    door.rotation.y=-doorOpen*1.35;
    const incoming=smooth(6,11,t),outgoing=smooth(20,25,t);
    const progress=t<20?incoming:1-outgoing,p=route.getPointAt(progress);
    running=(t>6&&t<11)||(t>20&&t<25);
    const runWeight=smooth(6,6.6,t)*(1-smooth(10.4,11,t))+smooth(20,20.6,t)*(1-smooth(24.4,25,t));
    const travelled=routeLength*(t<20?incoming:1+outgoing);
    deer.visible=true;deer.scale.setScalar(deerScale);
    let yaw=t<18.5?angleLerp(routeYaw(progress),Math.PI,smooth(10,11,t)):
      t<20?angleLerp(Math.PI,routeYaw(1,true),smooth(18.5,20,t)):routeYaw(progress,true);
    if(t>=25)yaw=angleLerp(routeYaw(0,true),routeYaw(0),smooth(25,27,t));
    deer.rotation.set(0,yaw,0);
    deer.position.set(p.x,groundAt(p.x,p.z)+Math.sin(travelled*38)*.003*runWeight,p.z);
    const footTargets=deerLegs.map((leg,i)=>{
      const phase=((travelled/.22+(i===0||i===3?0:.5))%1+1)%1;
      const swing=phase>=.6,s=swing?(phase-.6)/.4:phase/.6;
      const offset=(swing?THREE.MathUtils.lerp(-.05,.05,smooth(0,1,s)):THREE.MathUtils.lerp(.05,-.05,s))*runWeight;
      const localX=leg.x+offset,wx=p.x+(localX*Math.cos(yaw)+leg.z*Math.sin(yaw))*deerScale;
      const wz=p.z+(-localX*Math.sin(yaw)+leg.z*Math.cos(yaw))*deerScale;
      const lift=swing?Math.sin(s*Math.PI)*.047*runWeight:0;
      return {localX,offset,floor:groundAt(wx,wz),lift};
    });
    // Lower the pelvis over uneven snow so every supporting hoof remains reachable.
    deer.position.y=Math.min(deer.position.y,Math.min(...footTargets.map(f=>f.floor))+.015);
    for(let i=0;i<deerLegs.length;i++){
      const leg=deerLegs[i],{localX,offset,floor,lift}=footTargets[i];
      const localY=(floor-deer.position.y)/deerScale+lift;
      const targetY=localY+.014,k=knee(offset,targetY-.21,.118,.112,leg.x>0?-1:1);
      leg.upper.position.set(leg.x,.21,leg.z);leg.upper.rotation.z=Math.atan2(k.x,-k.y);
      leg.lower.position.set(leg.x+k.x,.21+k.y,leg.z);leg.lower.rotation.z=Math.atan2(offset-k.x,-(targetY-.21-k.y));
      leg.hoof.position.set(localX,localY,leg.z);
    }
    const pet=smooth(12,13,t)*(1-smooth(17,18,t)),stroke=Math.sin((t-13)*Math.PI*1.5);
    arms[0].rotation.x=THREE.MathUtils.lerp(-stride,-2.08+stroke*.10,pet);
    arms[0].rotation.z=pet*-.12;neck.rotation.z=pet*(-.45+stroke*.055);
    const wave=smooth(18,19,t)*(1-smooth(22.5,23,t));
    arms[0].rotation.x+=wave*(-2.2+Math.sin(t*7)*.15);
    stage=t<1.5?'door opens':t<6.8?'Santa walks out':t<11?'reindeer runs in':t<12?'reindeer stops':t<18?'gentle pats':t<20?'farewell':t<25?'reindeer runs away':t<28.5?'Santa returns home':'quiet';
  };
  update(0,0);
  const getContactDistance=()=>{
    group.updateMatrixWorld(true);
    const mitten=arms[0].localToWorld(new THREE.Vector3(-.015,-.205,.005));
    const forehead=neck.localToWorld(new THREE.Vector3(.10,.19,0));
    return mitten.distanceTo(forehead);
  };
  return {group,update,getContactDistance,prepareGround,groundAt:(x:number,z:number)=>groundAt(x,z),getState:()=>{
    group.updateMatrixWorld(true);
    const soles=legs.map(l=>l.boot.localToWorld(new THREE.Vector3()));
    const hooves=deerLegs.map(l=>l.hoof.localToWorld(new THREE.Vector3()));
    const santaLegGap=Math.max(...legs.map(l=>l.lower.localToWorld(new THREE.Vector3(0,-.075,0)).distanceTo(l.boot.localToWorld(new THREE.Vector3(0,.025,0)))));
    const deerLegGap=Math.max(...deerLegs.map(l=>l.lower.localToWorld(new THREE.Vector3(0,-.112,0)).distanceTo(l.hoof.localToWorld(new THREE.Vector3(0,.014,0)))));
    return {time,stage,running,santaVisible:santa.visible,deerVisible:deer.visible,santa:santa.position.toArray(),deer:deer.position.toArray(),doorAngle:door.rotation.y,handAngle:arms[0].rotation.x,santaLegGap,deerLegGap,soles:soles.map(v=>v.toArray()),hooves:hooves.map(v=>v.toArray())};
  }};
}

