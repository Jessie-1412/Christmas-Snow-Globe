type Vector = { x: number | null; y: number | null; z: number | null };
type Sample = { acceleration: Vector | null; accelerationIncludingGravity: Vector | null };
type PermissionAPI = typeof DeviceMotionEvent & { requestPermission?: () => Promise<string> };
export type MotionState = 'idle' | 'requesting' | 'listening' | 'denied' | 'unsupported' | 'no-data';

/** Detect vector motion, including side-to-side shakes whose total g-force stays constant. */
export class ShakeDetector {
  private gravity: number[] | null = null;
  private lastTime = 0;
  private pulseTime = -Infinity;
  private lastShake = -Infinity;
  reset() { this.gravity = null; this.lastTime = 0; this.pulseTime = -Infinity; this.lastShake = -Infinity; }
  sample(event: Sample, now: number): boolean {
    const valid = (v: Vector | null): v is Vector => !!v && [v.x,v.y,v.z].some(n => typeof n === 'number' && Number.isFinite(n));
    const vector = (v: Vector) => [v.x,v.y,v.z].map(n => typeof n === 'number' && Number.isFinite(n) ? n : 0);
    const linear = valid(event.acceleration) ? vector(event.acceleration) : null;
    let motion = linear;
    if (!motion) {
      if (!valid(event.accelerationIncludingGravity)) return false;
      const raw = vector(event.accelerationIncludingGravity);
      if (!this.gravity || now-this.lastTime > 1000) { this.gravity=raw;this.lastTime=now;return false; }
      const alpha=Math.exp(-Math.max(1,now-this.lastTime)/320);
      this.gravity=this.gravity.map((g,i)=>g*alpha+raw[i]*(1-alpha));
      motion=raw.map((v,i)=>v-this.gravity![i]);
    }
    this.lastTime=now;
    const strength=Math.hypot(...motion);
    if (now-this.lastShake<1100 || strength<3.2) return false;
    const gap=now-this.pulseTime;
    if (strength>=8.5 || (gap>=70 && gap<=600)) {
      this.lastShake=now;this.pulseTime=-Infinity;return true;
    }
    if (gap>600) this.pulseTime=now;
    return false;
  }
}

export function bindMotionSensor(options: {
  shake: () => void;
  status: (message: string, retry?: boolean) => void;
}) {
  const detector=new ShakeDetector();
  let state:MotionState='idle', samples=0, shakes=0, permissionGranted=false;
  let timer:ReturnType<typeof setTimeout> | undefined;
  const hasMotion=typeof DeviceMotionEvent!=='undefined';
  const permissionAPI=hasMotion ? DeviceMotionEvent as PermissionAPI : undefined;
  const mobile=navigator.maxTouchPoints>0 || matchMedia('(pointer: coarse)').matches || typeof permissionAPI?.requestPermission==='function';
  const hasVector=(v:Vector|null)=>!!v&&[v.x,v.y,v.z].some(n=>typeof n==='number'&&Number.isFinite(n));
  const onMotion=(event:DeviceMotionEvent)=>{
    if(document.hidden)return;
    if(!hasVector(event.acceleration)&&!hasVector(event.accelerationIncludingGravity))return;
    samples++;
    if(timer){clearTimeout(timer);timer=undefined;}
    if(state==='no-data'){state='listening';options.status('已开启摇雪，轻摇手机试试');}
    if(detector.sample(event,performance.now())){shakes++;options.shake();}
  };
  const listen=()=>{
    window.removeEventListener('devicemotion',onMotion);
    window.addEventListener('devicemotion',onMotion,{passive:true});
    detector.reset();state='listening';
    options.status('已开启摇雪，轻摇手机试试');
    if(timer)clearTimeout(timer);
    timer=setTimeout(()=>{
      if(state==='listening'&&samples===0){state='no-data';options.status('未收到体感数据，可在 Safari 中打开；长按也能摇雪',true);}
    },4000);
  };
  async function request(retry=false){
    if(!mobile)return;
    if(state==='requesting'||state==='listening')return;
    if((state==='denied'||state==='no-data'||state==='unsupported')&&!retry)return;
    if(!hasMotion||!window.isSecureContext){state='unsupported';options.status('当前浏览器不支持体感，长按水晶球也能摇雪');return;}
    state='requesting';
    try{
      // Must be called synchronously from a real tap/click; never from a delayed task.
      if(!permissionGranted&&typeof permissionAPI?.requestPermission==='function'){
        const permission=await permissionAPI.requestPermission();
        if(permission!=='granted'){state='denied';options.status('摇雪权限未开启，轻点此处重试',true);return;}
      }
      permissionGranted=true;samples=0;listen();
    }catch{
      state='idle';options.status('轻点此处开启手机摇雪',true);
    }
  }
  document.addEventListener('visibilitychange',()=>detector.reset());
  window.addEventListener('pageshow',()=>detector.reset());
  return {request,getStatus:()=>({state,samples,shakes})};
}
