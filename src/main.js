import * as THREE from 'three';
import { World } from './ecs.js';
import { Transform, Velocity, PlayerController, CACBrainComponent, ActionState, MeshComponent } from './components.js';
import { PhysicsSystem, CACSystem, PlayerInputSystem, Keys, GlobalState } from './systems.js';

let world, scene, camera, renderer, clock;
let playerEntityId = null;
const meshMap = new Map();
let aoeMesh = null;

function initThree() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color('#41a7d6'); 
  scene.fog = new THREE.FogExp2('#41a7d6', 0.015);
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth/window.innerHeight, 0.1, 1000);
  
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);
  
  const light = new THREE.DirectionalLight(0xfff5e6, 1.2);
  light.position.set(50, 100, 50);
  light.castShadow = true;
  light.shadow.camera.left = -50; light.shadow.camera.right = 50;
  light.shadow.camera.top = 50; light.shadow.camera.bottom = -50;
  scene.add(light);
  
  scene.add(new THREE.AmbientLight(0x404060, 0.6));
  
  const geo = new THREE.PlaneGeometry(300, 300, 40, 40);
  geo.rotateX(-Math.PI / 2);
  
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const y = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 4;
    pos.setY(i, y);
  }
  geo.computeVertexNormals();

  const mat = new THREE.MeshLambertMaterial({ color: 0x4ade80, flatShading: true });
  const ground = new THREE.Mesh(geo, mat);
  ground.receiveShadow = true;
  scene.add(ground);
  
  // AoE visualizer
  const aoeGeo = new THREE.TorusGeometry(1, 0.2, 8, 32);
  const aoeMat = new THREE.MeshBasicMaterial({ color: 0xff3333, transparent: true, opacity: 0.5 });
  aoeMesh = new THREE.Mesh(aoeGeo, aoeMat);
  aoeMesh.rotation.x = Math.PI / 2;
  aoeMesh.visible = false;
  scene.add(aoeMesh);

  clock = new THREE.Clock();
}

function initECS(config) {
  world = new World();
  world.addSystem(PlayerInputSystem);
  world.addSystem(CACSystem);
  world.addSystem(PhysicsSystem);
  
  playerEntityId = world.createEntity();
  world.addComponent(playerEntityId, Transform, { x: 0, z: 20 });
  const isDog = config.player === 'SHEEPDOG';
  world.addComponent(playerEntityId, Velocity, { maxSpeed: isDog ? 0.8 : 0.3 });
  world.addComponent(playerEntityId, PlayerController, { role: config.player });
  world.addComponent(playerEntityId, ActionState);
  world.addComponent(playerEntityId, MeshComponent, { 
    type: 'box', color: isDog ? 0xf5f5f4 : 0xfbcfe8, scale: isDog ? 2.0 : 1.0 
  });
  
  for (let i = 0; i < 15; i++) {
    const id = world.createEntity();
    world.addComponent(id, Transform, { x: (Math.random()-0.5)*40, z: (Math.random()-0.5)*40 });
    world.addComponent(id, Velocity, { maxSpeed: 0.5 });
    
    const isSheep = config.herd === 'SHEEP';
    world.addComponent(id, CACBrainComponent, { 
      role: config.herd,
      fearBias: isSheep ? 1.5 : 0.8,
      socialBias: isSheep ? 2.0 : 0.5
    });
    world.addComponent(id, MeshComponent, { 
      type: 'box', color: isSheep ? 0xffffff : 0xf97316, scale: 1.2
    });
  }
}

function updateCamera(pTrans, pScale, vel) {
  if (GlobalState.cameraMode === 'SLEW') {
    camera.position.set(GlobalState.slewPos.x, GlobalState.slewPos.y, GlobalState.slewPos.z);
    camera.rotation.set(GlobalState.slewRot.x, GlobalState.slewRot.y, 0, 'YXZ');
    return;
  }
  const target = new THREE.Vector3(pTrans.x, pTrans.y, pTrans.z);
  
  if (GlobalState.cameraMode === 'TOP') {
    const idealPos = new THREE.Vector3(pTrans.x, pTrans.y + 60, pTrans.z + 10);
    camera.position.lerp(idealPos, 0.1);
    camera.lookAt(target);
  } else if (GlobalState.cameraMode === '3RD') {
    const offset = new THREE.Vector3(0, pScale * 2.5, -pScale * 5);
    offset.applyAxisAngle(new THREE.Vector3(0,1,0), pTrans.rotationY);
    camera.position.lerp(target.clone().add(offset), 0.2);
    camera.lookAt(target.clone().add(new THREE.Vector3(Math.sin(pTrans.rotationY)*10, 0, Math.cos(pTrans.rotationY)*10)));
  } else if (GlobalState.cameraMode === '1ST') {
    const targetFOV = pScale < 1.5 ? 90 : 60;
    camera.fov += (targetFOV - camera.fov) * 0.1;
    camera.updateProjectionMatrix();
    const speed = vel ? Math.hypot(vel.vx, vel.vz) : 0;
    const bob = speed > 0.1 ? Math.sin(clock.getElapsedTime() * 15) * 0.1 * pScale : 0;
    camera.position.copy(new THREE.Vector3(pTrans.x, pTrans.y + pScale*0.8 + bob, pTrans.z));
    camera.lookAt(target.clone().add(new THREE.Vector3(Math.sin(pTrans.rotationY)*10, pTrans.y + pScale*0.8, Math.cos(pTrans.rotationY)*10)));
  }
}

function updateHUD() {
  const hud = document.getElementById('telemetry-hud');
  if (!GlobalState.telemetry) {
    hud.innerHTML = '<h3>CAC Telemetry</h3><p>No entity nearby</p>';
    return;
  }
  const t = GlobalState.telemetry;
  hud.innerHTML = `
    <h3>CAC Telemetry (${t.role})</h3>
    <div style="margin-bottom:5px;"><b>Goal:</b> <span style="color:#4ade80;">${t.goal}</span></div>
    <div><b>Fear:</b> ${(t.fear*100).toFixed(0)}%</div>
    <div style="background:#334155;height:8px;margin-bottom:10px;"><div style="background:#f87171;height:100%;width:${t.fear*100}%"></div></div>
    <div><b>Curiosity:</b> ${(t.curiosity*100).toFixed(0)}%</div>
    <div style="background:#334155;height:8px;"><div style="background:#60a5fa;height:100%;width:${t.curiosity*100}%"></div></div>
  `;
}

function renderSystem() {
  const renderables = world.query([Transform, MeshComponent]);
  
  for (const id of renderables) {
    const trans = world.getComponent(id, Transform);
    const mComp = world.getComponent(id, MeshComponent);
    
    let mesh = meshMap.get(id);
    if (!mesh) {
      const geo = new THREE.BoxGeometry();
      const mat = new THREE.MeshLambertMaterial({ color: mComp.color });
      mesh = new THREE.Mesh(geo, mat);
      mesh.scale.setScalar(mComp.scale);
      mesh.castShadow = true; mesh.receiveShadow = true;
      scene.add(mesh);
      meshMap.set(id, mesh);
    }
    
    mesh.position.set(trans.x, trans.y + mComp.scale/2, trans.z);
    mesh.rotation.y = trans.rotationY;
    if (id === playerEntityId) mesh.visible = GlobalState.cameraMode !== '1ST';
  }
  
  if (playerEntityId !== null) {
    const pTrans = world.getComponent(playerEntityId, Transform);
    const pMesh = world.getComponent(playerEntityId, MeshComponent);
    const pVel = world.getComponent(playerEntityId, Velocity);
    const pAction = world.getComponent(playerEntityId, ActionState);
    updateCamera(pTrans, pMesh.scale, pVel);
    
    // Render AoE
    if (pAction.isActive) {
      aoeMesh.visible = true;
      aoeMesh.position.set(pTrans.x, pTrans.y + 0.1, pTrans.z);
      const s = pAction.radius;
      aoeMesh.scale.set(s, s, s);
      aoeMesh.material.color.setHex(pAction.type === 'BARK' ? 0xff3333 : 0x33ff33);
      aoeMesh.material.opacity = 1.0 - (pAction.radius / pAction.maxRadius);
    } else {
      aoeMesh.visible = false;
    }
  }
  updateHUD();
}

function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(clock.getDelta(), 0.1);
  world.tick(dt);
  renderSystem();
  renderer.render(scene, camera);
}

document.getElementById('btn-start').onclick = () => {
  const config = {
    player: document.getElementById('sel-player').value,
    herd: document.getElementById('sel-herd').value,
    adv: document.getElementById('sel-adv').value
  };
  document.getElementById('lobby').style.display = 'none';
  document.getElementById('telemetry-hud').style.display = 'block';
  
  initThree();
  initECS(config);
  
  const updateInfo = () => { document.getElementById('hud').textContent = \`WASD: Move | SPACE: Action | V: \${GlobalState.cameraMode}\`; };
  updateInfo();
  
  window.addEventListener('keydown', e => { 
    if (e.key === 'v' || e.key === 'V') {
      const modes = ['3RD', '1ST', 'TOP', 'SLEW'];
      GlobalState.cameraMode = modes[(modes.indexOf(GlobalState.cameraMode) + 1) % modes.length];
      updateInfo();
    }
    const k = e.key.toLowerCase();
    if (Keys.hasOwnProperty(k)) Keys[k] = true; 
    if (e.code === 'Space') Keys.space = true;
  });
  window.addEventListener('keyup', e => { 
    const k = e.key.toLowerCase();
    if (Keys.hasOwnProperty(k)) Keys[k] = false; 
    if (e.code === 'Space') Keys.space = false;
  });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  loop();
};
