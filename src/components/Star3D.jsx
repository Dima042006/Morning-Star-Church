import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { prefersReducedMotion } from '../hooks';

/** Гранована 8-променева зірка: подвійна піраміда з пласким освітленням */
function starGeometry(points = 8, R = 1, rInner = 0.2, depth = 0.3) {
  const pos = [];
  const apexF = [0, 0, depth], apexB = [0, 0, -depth];
  const tip = (i) => {
    const a = Math.PI / 2 - (i * 2 * Math.PI) / points;
    const rr = i % 2 ? R * 0.58 : R;
    return [Math.cos(a) * rr, Math.sin(a) * rr, 0];
  };
  const inner = (i) => {
    const a = Math.PI / 2 - ((i + 0.5) * 2 * Math.PI) / points;
    return [Math.cos(a) * rInner, Math.sin(a) * rInner, 0];
  };
  for (let i = 0; i < points; i++) {
    const T = tip(i), Pn = inner(i), Pp = inner((i - 1 + points) % points);
    pos.push(...apexF, ...Pn, ...T, ...apexF, ...T, ...Pp);
    pos.push(...apexB, ...T, ...Pn, ...apexB, ...Pp, ...T);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
}

export default function Star3D({ className = '' }) {
  const hostRef = useRef(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduced = prefersReducedMotion();

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      host.classList.add('star3d--fallback');
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
    camera.position.set(0, 0, 4.4);

    const star = new THREE.Mesh(
      starGeometry(),
      new THREE.MeshStandardMaterial({ color: 0xe0d6cb, metalness: 0.55, roughness: 0.3, flatShading: true, side: THREE.DoubleSide })
    );
    star.rotation.z = -0.17;
    scene.add(star);

    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const key = new THREE.DirectionalLight(0xfff3e4, 2.6); key.position.set(-3, 4, 5); scene.add(key);
    const fill = new THREE.DirectionalLight(0x9a8a7a, 0.9); fill.position.set(4, -3, 2); scene.add(fill);
    const rim = new THREE.PointLight(0xffffff, 6, 10); rim.position.set(2, 2, -2); scene.add(rim);

    const resize = () => {
      const s = host.clientWidth;
      renderer.setSize(s, s, false);
      renderer.domElement.style.width = renderer.domElement.style.height = '100%';
      camera.aspect = 1; camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize); ro.observe(host); resize();

    // нахил слідом за курсором
    const target = { x: 0, y: 0 };
    const onMove = (e) => {
      target.x = (e.clientY / window.innerHeight - 0.5) * 0.7;
      target.y = (e.clientX / window.innerWidth - 0.5) * 0.9;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    let visible = true, raf = 0, spin = 0, t0 = performance.now();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) loop(); });
    io.observe(host);

    function loop(t = performance.now()) {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(64, t - t0); t0 = t;
      spin += dt * 0.00035;
      star.rotation.y += (target.y + spin - star.rotation.y) * 0.06;
      star.rotation.x += (target.x - star.rotation.x) * 0.06;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(loop);
    }

    if (reduced) { star.rotation.set(0.25, -0.5, -0.17); renderer.render(scene, camera); }
    else loop();

    return () => {
      cancelAnimationFrame(raf); io.disconnect(); ro.disconnect();
      window.removeEventListener('pointermove', onMove);
      star.geometry.dispose(); star.material.dispose(); renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={hostRef} className={`star3d ${className}`} aria-hidden="true" />;
}
