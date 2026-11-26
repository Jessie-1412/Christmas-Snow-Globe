// Recovered from the user's deployed v0.1 scene; see docs/PROVENANCE.md.
import * as THREE from 'three/webgpu';
const aw = new THREE.MeshStandardMaterial({ color: 2313022, roughness: .94 }), KU = new THREE.MeshStandardMaterial({ color: 1588792, roughness: .96 }), Sf = new THREE.MeshStandardMaterial({ color: 4683109, roughness: .98 }), QU = new THREE.MeshStandardMaterial({ color: 15922933, roughness: .91 }), zc = new THREE.MeshStandardMaterial({ color: 14150125, roughness: .88 }), Sr = new THREE.MeshStandardMaterial({ color: 16777215, roughness: .89 }), jU = new THREE.MeshStandardMaterial({ color: 8540742, roughness: .9 }), Jn = new THREE.MeshStandardMaterial({ color: 5519924, roughness: .95 }), Ia = new THREE.MeshStandardMaterial({ color: 10315345, roughness: .88 }), JU = new THREE.MeshStandardMaterial({ color: 4869197, roughness: .94 }), eI = new THREE.MeshStandardMaterial({ color: 12052713, metalness: .08, roughness: .19, transparent: !0, opacity: .85, depthWrite: !1 }), tI = new THREE.MeshStandardMaterial({ color: 9423059, metalness: .14, roughness: .17, transparent: !0, opacity: .88, depthWrite: !1 }), sI = new THREE.MeshStandardMaterial({ color: 16766087, emissive: 16756814, emissiveIntensity: 2.5, roughness: .25 }), nI = new THREE.MeshStandardMaterial({ color: 14068574, metalness: .74, roughness: .32 }), dh = new THREE.MeshStandardMaterial({ color: 11220020, roughness: .55 });
function yn(o, e, t, s = 0, n = 0, i = 0) { const r = new THREE.Mesh(e, t); return r.position.set(s, n, i), r.castShadow = !0, r.receiveShadow = !0, o.add(r), r; }
function Gt(o, e, t, s, n, i = 0, r = 0, a = 0) { return yn(o, new THREE.BoxGeometry(e, t, s), n, i, r, a); }
function Oi(o, e, t, s, n, i = 0, r = 0, a = 0, l = 16) { const c = yn(o, new THREE.SphereGeometry(1, l, Math.max(8, Math.round(l * .7))), n, i, r, a); return c.scale.set(e, t, s), c; }
function N0(o) { let e = o >>> 0; return () => (e = Math.imul(e, 1664525) + 1013904223 >>> 0, e / 4294967296); }
function lw(o, e, t, s, n) { const i = t.clone().sub(e), r = yn(o, new THREE.CylinderGeometry(s * .78, s, i.length(), 5), n, (e.x + t.x) / 2, (e.y + t.y) / 2, (e.z + t.z) / 2); return r.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), i.normalize()), r; }
function iI(o) {
    yn(o, new THREE.CylinderGeometry(1.4, 1.42, .13, 96, 1), zc, 0, -.045, 0);
    const e = new THREE.CircleGeometry(1.4, 128, 0, Math.PI * 2);
    e.rotateX(-Math.PI / 2);
    const t = e.attributes.position;
    for (let s = 0; s < t.count; s++) {
        const n = t.getX(s), i = t.getZ(s), r = Math.hypot(n, i), a = .025 + .035 * Math.sin(n * 6.7 + i * 3.2) + .027 * Math.sin(i * 10.9 - n * 4.2) + .07 * Math.exp(-((n + .7) ** 2 + (i + .35) ** 2) * 2.4);
        t.setY(s, a * (1 - .3 * (r / 1.4)));
    }
    e.computeVertexNormals(), yn(o, e, QU, 0, .029, 0);
    for (const [s, n, i] of [[-1.04, .6, .17], [-.77, .79, .2], [.91, .6, .13], [.35, -.95, .2], [-.3, -1.01, .16]])
        Oi(o, i, .073, i * .69, Sr, s, .045, n);
}
function rI(o) {
    const e = Oi(o, .49, .012, .33, tI, .48, .069, .67, 48);
    e.rotation.y = -.2, Oi(o, .37, .008, .24, eI, .49, .084, .66, 40).rotation.y = -.2;
    const t = N0(18);
    for (let n = 0; n < 24; n++) {
        const i = n / 24 * Math.PI * 2, r = .48 + .52 * Math.cos(i), a = .67 + .37 * Math.sin(i);
        Math.hypot(r, a) > 1.23 || Oi(o, .07 + t() * .07, .033, .045 + t() * .04, n % 3 === 0 ? Sr : zc, r, .065, a, 10);
    }
    const s = new THREE.MeshStandardMaterial({ color: 15399420, emissive: 6137005, emissiveIntensity: .12 });
    for (const [n, i, r, a] of [[.47, .61, .34, .4], [.3, .75, .22, -.65], [.7, .55, .16, .75]]) {
        const l = Gt(o, .009, .002, r, s, n, .085, i);
        l.rotation.y = a;
    }
}
function vf(o, e, t, s, n) { const i = yn(o, new THREE.ConeGeometry(s, n, 5, 1), zc, e, n / 2, t); i.rotation.y = .3; const r = yn(o, new THREE.ConeGeometry(s * .55, n * .47, 5, 1), Sr, e, n * .765, t); r.rotation.y = .3; }
function Gl(o, e, t, s, n) {
    const i = new THREE.Group;
    i.position.set(e, .025, t), o.add(i);
    const r = N0(n), a = yn(i, new THREE.CylinderGeometry(.024, .052, s * .81, 7), Jn, 0, s * .36, 0);
    a.rotation.z = (r() - .5) * .05;
    const l = Math.max(7, Math.round(s * 10));
    for (let c = 0; c < l; c++) {
        const u = c / l, h = s * (.14 + u * .78), d = (1 - u) ** 1.08 * s * .32, p = c < 3 ? 11 : 9;
        for (let f = 0; f < p; f++) {
            const m = f / p * Math.PI * 2 + (r() - .5) * .24 + c * .25, y = d * (.74 + r() * .29), x = new THREE.Vector3(0, h, 0), _ = new THREE.Vector3(Math.cos(m) * y, h - y * .28, Math.sin(m) * y);
            lw(i, x, _, .01 + (1 - u) * .012, c % 3 === 0 ? Sf : KU);
            const b = yn(i, new THREE.ConeGeometry(.058 + y * .17, y * .93, 5, 1), c % 4 === 0 ? Sf : aw);
            if (b.position.copy(x.clone().lerp(_, .61)), b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), _.clone().sub(x).normalize()), r() > .17) {
                const S = Oi(i, y * .3, .025 + s * .015, y * .2, c % 3 === 0 ? Sr : zc, _.x * .8, _.y + .028, _.z * .8, 9);
                S.rotation.y = m;
            }
        }
    }
    return yn(i, new THREE.ConeGeometry(.04, s * .2, 7), Sf, 0, s * .94, 0), Oi(i, .05, .028, .05, Sr, 0, s * 1.03, 0, 10), i;
}
function ju(o, e, t, s, n = .18, i = .24, r = !1) { const a = new THREE.Group; a.position.set(e, t, s), r && (a.rotation.y = Math.PI / 2), o.add(a), Gt(a, n + .045, i + .048, .019, Jn, 0, 0, 0), Gt(a, n, i, .008, sI, 0, 0, .016), Gt(a, .015, i + .016, .027, Ia, 0, 0, .03), Gt(a, n + .016, .014, .027, Ia, 0, 0, .032), Gt(a, n + .07, .034, .067, Sr, 0, i / 2 + .035, .008); }
function oI(o) {
    const e = new THREE.Group;
    e.position.set(.23, .12, -.2), o.add(e), Gt(e, .89, .63, .76, jU, 0, .34, 0);
    for (let i = 0; i < 15; i++) {
        const r = -.412 + i * .058;
        Gt(e, .009, .62, .011, i % 4 === 0 ? Ia : Jn, r, .34, .384), Gt(e, .009, .62, .011, Jn, r, .34, -.384);
    }
    for (let i = 0; i < 12; i++) {
        const r = -.35 + i * .063;
        Gt(e, .012, .62, .008, Jn, -.45, .34, r), Gt(e, .012, .62, .008, Jn, .45, .34, r);
    }
    const t = new THREE.Shape;
    t.moveTo(-.48, .66), t.lineTo(0, 1), t.lineTo(.48, .66), t.closePath();
    const s = new THREE.ExtrudeGeometry(t, { depth: .76, bevelEnabled: !1 });
    yn(e, s, Jn, 0, 0, -.38);
    for (const i of [-1, 1]) {
        const r = Gt(e, .62, .067, .94, JU, i * .245, .83, 0);
        r.rotation.z = i === -1 ? .59 : -.59;
        const a = Gt(e, .63, .086, .97, Sr, i * .245, .885, 0);
        a.rotation.z = r.rotation.z;
        for (let l = 0; l < 9; l++) {
            const c = -.44 + l * .11, u = i * .48, h = yn(e, new THREE.ConeGeometry(.014, .06 + l * 7 % 4 * .018, 5), zc, u, .63, c);
            h.rotation.z = Math.PI;
        }
    }
    Gt(e, .16, .38, .17, Jn, .26, 1.06, -.23), Gt(e, .23, .067, .23, Sr, .26, 1.28, -.23), Gt(e, .23, .44, .025, Jn, .035, .235, .395), Gt(e, .19, .39, .012, Ia, .035, .232, .417), Oi(e, .014, .014, .014, nI, .105, .24, .439), ju(e, -.245, .37, .398, .19, .25), ju(e, .31, .39, .398, .19, .23), ju(e, .462, .36, -.03, .19, .24, !0), ju(e, 0, .81, .399, .13, .16), yn(e, new THREE.TorusGeometry(.072, .023, 6, 12), aw, .038, .47, .437), Gt(e, .04, .08, .012, dh, .038, .405, .46), Oi(e, .029, .023, .019, dh, .017, .422, .471), Oi(e, .029, .023, .019, dh, .058, .422, .471);
    for (let i = 0; i < 3; i++)
        Gt(e, .48, .063, .16, Jn, 0, .055 - i * .035, .45 + i * .09), Gt(e, .5, .024, .17, Sr, 0, .095 - i * .035, .45 + i * .09);
    for (const i of [-.33, .33]) {
        for (const a of [.42, .69])
            Gt(e, .036, .22, .035, Ia, i, .16, a);
        const r = Gt(e, .035, .039, .32, Ia, i, .28, .56);
        r.rotation.x = -.13;
    }
    const n = new THREE.PointLight(16756054, .78, 1.7, 1.8);
    n.position.set(0, .48, .44), e.add(n);
}
function aI(o) {
    const e = N0(815);
    for (let t = 0; t < 5; t++) {
        const s = -1.05 + t * .08, n = .81 + t % 3 * .095, i = .19 + e() * .12;
        lw(o, new THREE.Vector3(s, .02, n), new THREE.Vector3(s + .04, i, n + .02), .007, Jn);
        for (let r = 0; r < 3; r++) {
            const a = (e() - .5) * .1;
            Oi(o, .023, .023, .022, dh, s + .04 + a, i - .012 + r * .016, n + .02, 9);
        }
    }
}
function lI() { const o = new THREE.Group; return iI(o), rI(o), vf(o, -.28, -1.04, .35, .63), vf(o, .25, -1.1, .39, .73), vf(o, .88, -.95, .26, .46), oI(o), Gl(o, -.93, -.35, 1.35, 101), Gl(o, -.72, -.89, .83, 203), Gl(o, .99, -.47, .83, 306), Gl(o, .97, .25, .55, 457), Gl(o, .05, -.93, .64, 512), aI(o), { group: o, accumulatableSnowMeshes: [] }; }

export { lI as buildArcticScene };
