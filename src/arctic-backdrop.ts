import * as THREE from 'three/webgpu';
import { createRng } from './textures';

/** Preblurred distant landscape; no per-frame postprocessing on phones. */
export function createArcticBackdrop() {
  const canvas=document.createElement('canvas');canvas.width=1536;canvas.height=768;
  const ctx=canvas.getContext('2d')!;
  const sky=ctx.createLinearGradient(0,0,0,768);
  sky.addColorStop(0,'#142334');sky.addColorStop(.48,'#344d64');sky.addColorStop(.75,'#75828a');sky.addColorStop(1,'#536371');
  ctx.fillStyle=sky;ctx.fillRect(0,0,1536,768);
  const glow=ctx.createRadialGradient(930,370,0,930,370,550);
  glow.addColorStop(0,'#b0c6d517');glow.addColorStop(1,'#acc1d000');ctx.fillStyle=glow;ctx.fillRect(0,0,1536,768);
  const rng=createRng(415);
  // Soft auroral curtains in the distant sky, deliberately subordinate to the globe.
  ctx.filter='blur(28px)';ctx.globalAlpha=.13;ctx.lineWidth=46;
  for(let j=0;j<3;j++){
    ctx.strokeStyle=j===0?'#70b8ac':'#a8a8cb';ctx.beginPath();
    for(let x=0;x<=1536;x+=12){const y=200+j*27+Math.sin(x*.003+j*.3)*65+Math.sin(x*.008)*20;x?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();
  }
  ctx.globalAlpha=1;ctx.filter='blur(6px)';
  for(let layer=0;layer<3;layer++){
    ctx.fillStyle=['#435b70','#344b5e','#283e50'][layer];ctx.beginPath();ctx.moveTo(0,768);
    for(let x=0;x<=1570;x+=35){const y=430+layer*65+Math.sin(x*.006+layer*2)*45+Math.sin(x*.013+layer)*23;ctx.lineTo(x,y)}
    ctx.lineTo(1536,768);ctx.fill();
  }
  ctx.filter='blur(2px)';
  for(let i=0;i<60;i++){
    const x=rng()*1536,y=570+rng()*180,h=15+rng()*45;ctx.fillStyle='#243b4a';
    ctx.beginPath();ctx.moveTo(x,y-h);ctx.lineTo(x-h*.27,y);ctx.lineTo(x+h*.27,y);ctx.fill();
  }
  // Sparse warm, defocused lights give scale to the blue distance.
  for(let i=0;i<18;i++){
    const x=rng()*1536,y=590+rng()*100,r=3+rng()*8;ctx.filter=`blur(${r*.45}px)`;ctx.globalAlpha=.1+rng()*.15;ctx.fillStyle='#ffcf9d';ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();
  }
  ctx.filter='none';ctx.globalAlpha=1;
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
}
