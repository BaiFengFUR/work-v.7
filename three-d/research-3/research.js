const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a1a);

const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 12, 26);
camera.lookAt(0, 0, 0);

scene.add(new THREE.AmbientLight(0xffffff, 0.5));
const dir = new THREE.DirectionalLight(0xffffff, 0.8);
dir.position.set(8, 15, 10);
scene.add(dir);

let antialias = true;
let objectCount = 1000;
let renderer;
let bodyGroup = null;

const sharedGeo = new THREE.SphereGeometry(0.28, 8, 8);
const sharedMat = new THREE.MeshStandardMaterial({ color: 0x4fc3f7 });

function buildBodies(n) {
  if (bodyGroup) {
    scene.remove(bodyGroup);
  }
  bodyGroup = new THREE.Group();
  const side = Math.ceil(Math.cbrt(n));
  let created = 0;
  for (let x = 0; x < side && created < n; x++) {
    for (let y = 0; y < side && created < n; y++) {
      for (let z = 0; z < side && created < n; z++) {
        const m = new THREE.Mesh(sharedGeo, sharedMat);
        m.position.set(
          (x - side / 2) * 0.9 + (Math.random() - 0.5) * 0.3,
          (y - side / 2) * 0.9 + (Math.random() - 0.5) * 0.3,
          (z - side / 2) * 0.9 + (Math.random() - 0.5) * 0.3
        );
        bodyGroup.add(m);
        created++;
      }
    }
  }
  scene.add(bodyGroup);
}

function createRenderer() {
  if (renderer) {
    renderer.dispose();
    renderer.domElement.remove();
  }
  renderer = new THREE.WebGLRenderer({ antialias: antialias });
  renderer.setPixelRatio(1);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
}

createRenderer();
buildBodies(objectCount);

const fpsEl = document.getElementById('fps');
let frames = 0;
let lastStamp = performance.now();
let currentFps = 0;

function animate() {
  requestAnimationFrame(animate);
  if (bodyGroup) bodyGroup.rotation.y += 0.003;
  renderer.render(scene, camera);

  frames++;
  const now = performance.now();
  if (now - lastStamp >= 1000) {
    currentFps = Math.round((frames * 1000) / (now - lastStamp));
    fpsEl.textContent = currentFps + ' FPS';
    frames = 0;
    lastStamp = now;
  }
}
animate();

const cfgEl = document.getElementById('cfg');
function refreshCfg() {
  cfgEl.textContent = '当前：抗锯齿' + (antialias ? '开' : '关') + ' / ' + objectCount + '个物体';
}

document.getElementById('aaOn').onclick = function () {
  antialias = true;
  this.classList.add('active');
  document.getElementById('aaOff').classList.remove('active');
  createRenderer();
  refreshCfg();
};
document.getElementById('aaOff').onclick = function () {
  antialias = false;
  this.classList.add('active');
  document.getElementById('aaOn').classList.remove('active');
  createRenderer();
  refreshCfg();
};
document.querySelectorAll('.cnt').forEach(btn => {
  btn.onclick = () => {
    objectCount = parseInt(btn.dataset.n);
    document.querySelectorAll('.cnt').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    buildBodies(objectCount);
    refreshCfg();
  };
});

let recordNo = 0;
document.getElementById('record').onclick = () => {
  recordNo++;
  const table = document.getElementById('logTable');
  const tr = document.createElement('tr');
  tr.innerHTML =
    '<td>' + recordNo + '</td>' +
    '<td>' + (antialias ? '开' : '关') + '</td>' +
    '<td>' + objectCount + '</td>' +
    '<td>' + currentFps + '</td>';
  table.appendChild(tr);
};
document.getElementById('clear').onclick = () => {
  document.getElementById('logTable').innerHTML =
    '<tr><th>#</th><th>抗锯齿</th><th>物体数</th><th>FPS</th></tr>';
  recordNo = 0;
};

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
