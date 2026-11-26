import { bindMotionSensor } from './motion';
import { bindOrientationSensor } from './orientation';
export function bindGlobeGestures(canvas: HTMLCanvasElement, actions: {
  rotate: (dx: number, dy: number) => void;
  zoom: (ratio: number) => void;
  reset: () => void;
  shake: () => void;
  interact: () => void;
  tilt?: (theta: number, phi: number) => void;
}) {
  const points = new Map<number, { x: number; y: number }>();
  let distance = 0, lastTap = 0, tapX = 0, tapY = 0, moved = false, started = 0;
  let holdTimer:ReturnType<typeof setTimeout>|undefined;
  let hintTimer:ReturnType<typeof setTimeout>|undefined;
  const hint = document.getElementById('gesture-hint');
  const showHint = (message: string, retry=false) => {
    if(hintTimer)clearTimeout(hintTimer);
    if (hint) {
      hint.textContent = message; hint.classList.remove('hidden');
      hint.style.pointerEvents=retry?'auto':'none';
      hint.style.cursor=retry?'pointer':'default';
      if(retry){hint.setAttribute('role','button');hint.tabIndex=0;}
      else{hint.removeAttribute('role');hint.removeAttribute('tabindex');}
    }
    if(!retry)hintTimer=window.setTimeout(() => hint?.classList.add('hidden'), 6500);
  };
  const motion=bindMotionSensor({shake:actions.shake,status:showHint});
  const orientation=bindOrientationSensor({tilt:actions.tilt ?? (()=>{}),status:showHint});
  const request=(retry=false)=>{void motion.request(retry);void orientation.request(retry);};
  canvas.addEventListener('click',()=>request());
  canvas.addEventListener('touchend',()=>request(),{passive:true});
  hint?.addEventListener('click',()=>request(true));
  hint?.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();request(true);}});
  const cancelHold=()=>{if(holdTimer){clearTimeout(holdTimer);holdTimer=undefined;}};
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', e => {
    if (e.button !== 0) return;
    actions.interact();
    orientation.recenter(); orientation.pause(true);
    if (points.size === 0) { moved = false; started = performance.now(); tapX = e.clientX; tapY = e.clientY; }
    points.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.setPointerCapture(e.pointerId);
    if (points.size > 1) { moved = true; lastTap = 0; }
    cancelHold();
    if(points.size===1)holdTimer=window.setTimeout(()=>{if(points.size===1&&!moved){moved=true;lastTap=0;actions.shake();showHint('雪花飘起来了');}},650);
    distance = 0;
  });
  canvas.addEventListener('pointermove', e => {
    const old = points.get(e.pointerId);
    if (!old) return;
    const dx = e.clientX - old.x, dy = e.clientY - old.y;
    points.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (Math.hypot(e.clientX - tapX, e.clientY - tapY) > 9) { moved = true;cancelHold(); }
    if (points.size === 2) {
      const [a, b] = [...points.values()];
      const next = Math.hypot(a.x - b.x, a.y - b.y);
      if (distance > 0 && next > 0) actions.zoom(distance / next);
      distance = next;
    } else if (points.size === 1) actions.rotate(dx, dy);
  });
  const finish = (e: PointerEvent) => {
    cancelHold();
    if (!points.has(e.pointerId)) return;
    const now = performance.now();
    if (e.type === 'pointerup' && points.size === 1 && !moved && now - started < 300) {
      if (now - lastTap < 340) { orientation.recenter();actions.reset(); lastTap = 0; } else lastTap = now;
    }
    points.delete(e.pointerId); distance = 0;
    if(!points.size)orientation.pause(false);
    if (canvas.hasPointerCapture(e.pointerId)) canvas.releasePointerCapture(e.pointerId);
  };
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  canvas.addEventListener('lostpointercapture', e => { cancelHold();points.delete(e.pointerId); distance = 0;if(!points.size)orientation.pause(false); });
  canvas.addEventListener('contextmenu',e=>e.preventDefault());
  window.addEventListener('blur', () => { cancelHold();points.clear(); distance = 0;orientation.pause(false);orientation.recenter(); });
  canvas.addEventListener('wheel', e => {
    e.preventDefault(); actions.interact(); actions.zoom(Math.exp(e.deltaY * .001));
  }, { passive: false });
  canvas.addEventListener('keydown', e => {
    if (e.key === 'Home') {orientation.recenter();actions.reset();}
    if (e.key === '+' || e.key === '=') actions.zoom(.9);
    if (e.key === '-') actions.zoom(1.1);
    if (e.key.startsWith('Arrow')) { e.preventDefault(); actions.rotate(e.key === 'ArrowLeft' ? 25 : e.key === 'ArrowRight' ? -25 : 0, e.key === 'ArrowUp' ? 20 : e.key === 'ArrowDown' ? -20 : 0); }
  });
  hintTimer=window.setTimeout(() => hint?.classList.add('hidden'), 7500);
  return {getMotionStatus:motion.getStatus,getOrientationStatus:orientation.getStatus};
}
