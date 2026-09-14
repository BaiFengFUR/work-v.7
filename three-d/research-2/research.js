const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.set(0, 6, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;

scene.add(new THREE.AmbientLight(0xffffff, 0.15));
const sunLight = new THREE.PointLight(0xffffff, 1.5, 30);
scene.add(sunLight);

function makeBody(geometry, color, name) {
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color }));
  mesh.userData.name = name;
  mesh.userData.originalColor = color;
  return mesh;
}
const sun = new THREE.Mesh(
  new THREE.SphereGeometry(1.2, 32, 32),
  new THREE.MeshBasicMaterial({ color: 0xe53935 })
);
sun.userData = { name: '太阳', originalColor: 0xe53935 };
scene.add(sun);

const earth = makeBody(new THREE.SphereGeometry(0.45, 32, 32), 0x42a5f5, '地球');
scene.add(earth);
const saturn = makeBody(new THREE.SphereGeometry(0.7, 32, 32), 0xfdd835, '土星');
scene.add(saturn);

const pickables = [sun, earth, saturn]; 
const earthRadius = 3, saturnRadius = 5;
let earthAngle = 0, saturnAngle = Math.PI;

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2(); 
let selected = null;
const infoEl = document.getElementById('info');
const tagEl = document.getElementById('tag');

const highlightColor = { '太阳': 0xffeb3b, '地球': 0x00e5ff, '土星': 0xffffff };

window.addEventListener('click', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(pointer, camera);

  const hits = raycaster.intersectObjects(pickables);

  if (selected) selected.material.color.setHex(selected.userData.originalColor);

  if (hits.length > 0) {
    selected = hits[0].object;
    selected.material.color.setHex(highlightColor[selected.userData.name]);
    infoEl.textContent = '已选中：' + selected.userData.name + '（已变色高亮）';
    tagEl.textContent = selected.userData.name;
    tagEl.style.display = 'block';
  } else {
    selected = null;
    infoEl.textContent = '当前未选中任何天体';
    tagEl.style.display = 'none';
  }
});

renderer.domElement.addEventListener('mousemove', (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hit = raycaster.intersectObjects(pickables).length > 0;
  renderer.domElement.style.cursor = hit ? 'pointer' : 'default';
});

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

const proj = new THREE.Vector3();

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

  if (selected) {
    proj.copy(selected.position).project(camera);
    tagEl.style.left = (proj.x * 0.5 + 0.5) * window.innerWidth + 'px';
    tagEl.style.top = (-proj.y * 0.5 + 0.5) * window.innerHeight + 'px';
  }

  controls.update();
  renderer.render(scene, camera);
};
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
