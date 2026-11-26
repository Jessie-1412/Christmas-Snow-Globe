import * as THREE from 'three/webgpu';

/** Two small Loop subdivision passes preserve UV seams and blend discrete skin joints.
 * The downloaded asset stays 159 KB; the rounded surface is built once at load time.
 */
export function smoothFox(input: THREE.BufferGeometry, passes = 2) {
  let geometry = input.index ? input.toNonIndexed() : input.clone();
  for (let pass = 0; pass < passes; pass++) {
    const p = geometry.getAttribute('position'), uv = geometry.getAttribute('uv');
    const si = geometry.getAttribute('skinIndex'), sw = geometry.getAttribute('skinWeight');
    const ids: number[] = [], points: THREE.Vector3[] = [], neighbors: Set<number>[] = [];
    const lookup = new Map<string, number>();
    for (let i = 0; i < p.count; i++) {
      const key = `${p.getX(i).toFixed(5)},${p.getY(i).toFixed(5)},${p.getZ(i).toFixed(5)}`;
      let id = lookup.get(key);
      if (id === undefined) { id = points.length; lookup.set(key, id); points.push(new THREE.Vector3().fromBufferAttribute(p, i)); neighbors.push(new Set()); }
      ids.push(id);
    }
    const edges = new Map<string, number[]>();
    const edgeKey = (a: number, b: number) => a < b ? `${a}:${b}` : `${b}:${a}`;
    for (let i = 0; i < p.count; i += 3) for (let j = 0; j < 3; j++) {
      const a = ids[i + j], b = ids[i + (j + 1) % 3], opposite = ids[i + (j + 2) % 3];
      neighbors[a].add(b); neighbors[b].add(a);
      const key = edgeKey(a, b); const list = edges.get(key) || []; if (!list.includes(opposite)) list.push(opposite); edges.set(key, list);
    }
    const smooth = points.map((point, i) => {
      const n = neighbors[i].size, beta = n === 3 ? 3 / 16 : 3 / (8 * Math.max(1, n));
      const value = point.clone().multiplyScalar(1 - n * beta);
      for (const id of neighbors[i]) value.addScaledVector(points[id], beta); return value;
    });
    type Vertex = { position: THREE.Vector3; tex: THREE.Vector2; joints: number[]; weights: number[] };
    const vertex = (i: number): Vertex => ({position: smooth[ids[i]], tex: new THREE.Vector2(uv.getX(i), uv.getY(i)), joints: [si.getX(i),si.getY(i),si.getZ(i),si.getW(i)],weights:[sw.getX(i),sw.getY(i),sw.getZ(i),sw.getW(i)]});
    const midpoint = (a: number, b: number): Vertex => {
      const opposite = edges.get(edgeKey(ids[a],ids[b]))!;
      const position = points[ids[a]].clone().add(points[ids[b]]).multiplyScalar(opposite.length === 2 ? 3/8 : .5);
      if (opposite.length === 2) for (const id of opposite) position.addScaledVector(points[id], 1/8);
      const av = vertex(a), bv = vertex(b), influences = new Map<number, number>();
      for (const v of [av,bv]) for(let j=0;j<4;j++) influences.set(v.joints[j],(influences.get(v.joints[j])||0)+v.weights[j]*.5);
      const top = [...influences].sort((a,b)=>b[1]-a[1]).slice(0,4); while(top.length<4)top.push([0,0]);
      const total = top.reduce((sum,v)=>sum+v[1],0)||1;
      return {position,tex:av.tex.clone().add(bv.tex).multiplyScalar(.5),joints:top.map(v=>v[0]),weights:top.map(v=>v[1]/total)};
    };
    const positions:number[]=[],texcoords:number[]=[],joints:number[]=[],weights:number[]=[];
    const emit = (...vertices: Vertex[]) => { for(const v of vertices){positions.push(v.position.x,v.position.y,v.position.z);texcoords.push(v.tex.x,v.tex.y);joints.push(...v.joints);weights.push(...v.weights);} };
    for(let i=0;i<p.count;i+=3){const a=vertex(i),b=vertex(i+1),c=vertex(i+2),ab=midpoint(i,i+1),bc=midpoint(i+1,i+2),ca=midpoint(i+2,i);emit(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca);}
    const next=new THREE.BufferGeometry();next.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));next.setAttribute('uv',new THREE.Float32BufferAttribute(texcoords,2));next.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(joints,4));next.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));next.computeVertexNormals();geometry.dispose();geometry=next;
  }
  return geometry;
}
