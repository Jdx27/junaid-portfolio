import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const canvas = document.querySelector('#scene');
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const smallScreen = window.matchMedia('(max-width: 700px)').matches;
let renderer, scene, camera, orb, orbGroup, particles, particlePositions, particleMaterial;
let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;
let animationFrame = 0;

try {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.z = 8.8;
  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  orbGroup = new THREE.Group();
  scene.add(orbGroup);

  const sphereGeometry = new THREE.IcosahedronGeometry(1.35, 5);
  const sphereMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x3159bc, metalness: 0.62, roughness: 0.22,
    clearcoat: 1, clearcoatRoughness: 0.16, iridescence: 0.38,
    emissive: 0x101c65, emissiveIntensity: 0.45
  });
  orb = new THREE.Mesh(sphereGeometry, sphereMaterial);
  orbGroup.add(orb);

  const wire = new THREE.Mesh(
    new THREE.IcosahedronGeometry(1.39, 2),
    new THREE.MeshBasicMaterial({ color: 0x79dfff, wireframe: true, transparent: true, opacity: 0.12 })
  );
  orbGroup.add(wire);

  const haloMaterial = new THREE.MeshBasicMaterial({ color: 0x63e9e0, transparent: true, opacity: 0.12, side: THREE.BackSide });
  const halo = new THREE.Mesh(new THREE.SphereGeometry(1.55, 48, 48), haloMaterial);
  orbGroup.add(halo);

  const ringMat = new THREE.MeshBasicMaterial({ color: 0x7ebdff, transparent: true, opacity: 0.48 });
  const ring1 = new THREE.Mesh(new THREE.TorusGeometry(1.95, 0.006, 8, 180), ringMat);
  ring1.rotation.set(1.15, 0.25, -0.35);
  orbGroup.add(ring1);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.2, 0.004, 8, 180), new THREE.MeshBasicMaterial({ color: 0x62eee0, transparent: true, opacity: 0.25 }));
  ring2.rotation.set(0.3, 1.0, 0.5);
  orbGroup.add(ring2);

  scene.add(new THREE.AmbientLight(0x9ccaff, 1.35));
  const keyLight = new THREE.PointLight(0x76c7ff, 34, 18);
  keyLight.position.set(3, 3, 4); scene.add(keyLight);
  const cyanLight = new THREE.PointLight(0x5df4df, 24, 16);
  cyanLight.position.set(-3, -2, 2); scene.add(cyanLight);
  const rimLight = new THREE.PointLight(0x5668ff, 26, 15);
  rimLight.position.set(0, 3, -3); scene.add(rimLight);

  // Tiny floating particles around the 3D object.
  const count = smallScreen ? 450 : 850;
  particlePositions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 13;
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 9;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 8 - 1;
  }
  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  particleMaterial = new THREE.PointsMaterial({ color: 0x9ccfff, size: 0.018, transparent: true, opacity: 0.7, sizeAttenuation: true });
  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);

  const pointerMove = (event) => {
    pointerX = (event.clientX / window.innerWidth) * 2 - 1;
    pointerY = (event.clientY / window.innerHeight) * 2 - 1;
    targetX = pointerX * 0.32;
    targetY = pointerY * 0.2;
  };
  window.addEventListener('pointermove', pointerMove, { passive: true });

  function resizeScene() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.position.z = window.innerWidth < 600 ? 10.5 : 8.8;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', resizeScene);

  const clock = new THREE.Clock();
  function render() {
    animationFrame = requestAnimationFrame(render);
    const t = clock.getElapsedTime();
    if (!reducedMotion) {
      orb.rotation.y += 0.0025;
      orb.rotation.x += 0.0008;
      orbGroup.rotation.y += (targetX - orbGroup.rotation.y) * 0.025;
      orbGroup.rotation.x += (-targetY - orbGroup.rotation.x) * 0.025;
      orbGroup.position.y = Math.sin(t * 0.55) * 0.08;
      particles.rotation.y = t * 0.008;
      particles.rotation.x = Math.sin(t * 0.12) * 0.04;
    }
    renderer.render(scene, camera);
  }
  render();
} catch (error) {
  // Keep the page readable if WebGL is unavailable or blocked.
  console.warn('3D scene could not start; the portfolio content remains available.', error);
  canvas.style.display = 'none';
}

document.querySelector('#menuToggle').addEventListener('click', () => {
  const nav = document.querySelector('#nav');
  const isOpen = nav.classList.toggle('open');
  document.querySelector('#menuToggle').setAttribute('aria-expanded', String(isOpen));
});
document.querySelectorAll('#nav a').forEach(link => link.addEventListener('click', () => {
  document.querySelector('#nav').classList.remove('open');
  document.querySelector('#menuToggle').setAttribute('aria-expanded', 'false');
}));
document.querySelector('#year').textContent = new Date().getFullYear();

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

document.querySelector('#copyEmail').addEventListener('click', async () => {
  const email = 'mjunaidhassanjadoonpk786@gmail.com';
  const status = document.querySelector('#copyStatus');
  try {
    await navigator.clipboard.writeText(email);
    status.textContent = 'Email copied to clipboard.';
  } catch {
    status.textContent = email;
  }
});

// Stop rendering when the tab is hidden to save resources.
document.addEventListener('visibilitychange', () => {
  if (document.hidden && animationFrame) cancelAnimationFrame(animationFrame);
  else if (!document.hidden && renderer && animationFrame) {
    // render() schedules the next frame; restarting after cancellation.
    renderRestart();
  }
});
function renderRestart() {
  if (!renderer || document.hidden) return;
  // A separate lightweight loop is avoided; reload the module's render loop by dispatching resize.
  window.dispatchEvent(new Event('resize'));
}
