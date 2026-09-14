const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);

controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 4;
controls.maxDistance = 22;
controls.enablePan = true;
controls.target.set(0, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.15));
const sunLight = new THREE.PointLight(0xffffff, 1.5, 30);
scene.add(sunLight);

const sun = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xe53935 })
);
scene.add(sun);

const earth = new THREE.Mesh(
  new THREE.SphereGeometry(0.45, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0x42a5f5 })
);
scene.add(earth);
const saturn = new THREE.Mesh(
  new THREE.SphereGeometry(0.7, 32, 32),
  new THREE.MeshStandardMaterial({ color: 0xfdd835 })
);
scene.add(saturn);
const earthRadius = 3, saturnRadius = 5;
let earthAngle = 0, saturnAngle = Math.PI;

const stars = [];
const starPos = [
  [-8, 5, -10], [7, 4, -8], [-6, -3, -9], [9, -2, -12],
  [0, 7, -15], [-10, 2, -6], [5, 6, -14], [-4, -5, -11]
];
starPos.forEach(p => {
  const star = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 8, 8),
    new THREE.MeshBasicMaterial({ color: 0xffffff })
  );
  star.position.set(p[0], p[1], p[2]);
  star.userData.phase = Math.random() * Math.PI * 2;
  scene.add(star);
  stars.push(star);
});

const clock = new THREE.Clock();
const animate = () => {
  requestAnimationFrame(animate);
  const t = clock.getElapsedTime();

  sun.rotation.y += 0.005;
  earthAngle += 0.01;
  saturnAngle += 0.006;
  earth.position.set(Math.cos(earthAngle) * earthRadius, 0, Math.sin(earthAngle) * earthRadius);
  saturn.position.set(Math.cos(saturnAngle) * saturnRadius, 0, Math.sin(saturnAngle) * saturnRadius);
  stars.forEach(s => s.scale.setScalar(1 + 0.6 * Math.sin(t * 2 + s.userData.phase)));

  controls.update();

  renderer.render(scene, camera);
};
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
