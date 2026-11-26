import { Euler, Quaternion, Vector3 } from 'three';

/** Relative device pose: no compass permission, no accumulated angular drift. */
export class OrientationTracker {
  private reference: Quaternion | null = null;
  reset() { this.reference = null; }
  sample(alpha: number | null, beta: number | null, gamma: number | null, screenAngle = 0) {
    if (![alpha, beta, gamma].every(n => typeof n === 'number' && Number.isFinite(n))) return null;
    const rad = Math.PI / 180;
    const pose = new Quaternion().setFromEuler(new Euler(beta! * rad, alpha! * rad, -gamma! * rad, 'YXZ'));
    pose.multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), -screenAngle * rad));
    if (!this.reference) this.reference = pose.clone();
    const relative = this.reference.clone().invert().multiply(pose);
    const forward = new Vector3(0, 0, -1).applyQuaternion(relative);
    const up = new Vector3(0, 1, 0).applyQuaternion(relative);
    const clamp = (v: number, max: number) => Math.max(-max, Math.min(max, v));
    return {
      theta: clamp((-Math.atan2(forward.x, -forward.z) + Math.atan2(up.x, up.y)) * .8, .42),
      phi: clamp(-Math.atan2(forward.y, Math.hypot(forward.x, forward.z)) * .65, .22),
    };
  }
}

export function bindOrientationSensor(options: {
  tilt: (theta: number, phi: number) => void;
  status: (message: string, retry?: boolean) => void;
}) {
  const tracker = new OrientationTracker();
  const api = typeof DeviceOrientationEvent !== 'undefined'
    ? DeviceOrientationEvent as typeof DeviceOrientationEvent & { requestPermission?: () => Promise<string> } : undefined;
  let state = 'idle', samples = 0, paused = false, granted = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const recenter = () => { tracker.reset(); options.tilt(0, 0); };
  const onOrientation = (event: DeviceOrientationEvent) => {
    if (document.hidden || paused) return;
    const pose = tracker.sample(event.alpha, event.beta, event.gamma, screen.orientation?.angle ?? window.orientation ?? 0);
    if (!pose) return;
    samples++;
    if (timer) { clearTimeout(timer); timer = undefined; }
    if (state !== 'listening') options.status('体感已开启，倾斜手机转动视角 · 双击重新校准');
    state = 'listening'; options.tilt(pose.theta, pose.phi);
  };
  async function request(retry = false) {
    if (!(navigator.maxTouchPoints > 0 || matchMedia('(pointer: coarse)').matches || api?.requestPermission)) return;
    if (state === 'requesting' || state === 'listening' || (state !== 'idle' && !retry)) return;
    if (!api || !isSecureContext) { state = 'unsupported'; options.status('当前浏览器不支持体感，可用手指转动视角'); return; }
    state = 'requesting';
    try {
      // Invoke before any await so Safari receives the original user activation.
      if (!granted && api.requestPermission && await api.requestPermission() !== 'granted') {
        state = 'denied'; options.status('轻点此处开启体感转动', true); return;
      }
      granted = true; samples = 0; recenter();
      window.removeEventListener('deviceorientation', onOrientation);
      window.addEventListener('deviceorientation', onOrientation, { passive: true });
      state = 'waiting';
      options.status('请自然握持手机，轻轻倾斜转动视角');
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (!samples) { state = 'no-data'; options.status('未收到方向数据，请在 Safari 打开；轻点重试', true); }
      }, 4000);
    } catch { state = 'idle'; options.status('轻点此处开启体感转动', true); }
  }
  document.addEventListener('visibilitychange', recenter);
  window.addEventListener('pageshow', recenter);
  window.addEventListener('orientationchange', recenter);
  screen.orientation?.addEventListener('change', recenter);
  return { request, recenter, pause: (value: boolean) => { paused = value; }, getStatus: () => ({ state, samples }) };
}
