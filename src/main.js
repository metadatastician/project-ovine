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
  
  const geo = new THREE.PlaneGeometry(300, 300, 60, 60);
  geo.rotateX(-Math.PI / 2);
  
  const colors = [];
  const pos = geo.attributes.position;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const distFromRiver = Math.abs(x);
    const riverDip = Math.max(0, 20 - distFromRiver) * -0.5;
    const hill = Math.sin(x * 0.02) * Math.cos(z * 0.02) * 15;
    const y = Math.max(riverDip + hill, -1.5);
    pos.setY(i, y);
    
    // Vertex Colors
    if (y < 0) {
      colors.push(0.9, 0.8, 0.4); // Sand near water
    } else if (y > 10) {
      colors.push(0.3, 0.3, 0.3); // Rocky hills
    } else {
      colors.push(0.2, 0.8, 0.3); // Grass
    }
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geo.computeVertexNormals();

  const mat = new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true });
  const ground = new THREE.Mesh(geo, mat);
  ground.receiveShadow = true;
  scene.add(ground);
  
  // River Plane
  const waterGeo = new THREE.PlaneGeometry(40, 300);
  waterGeo.rotateX(-Math.PI / 2);
  const waterMat = new THREE.MeshBasicMaterial({ color: 0x3b82f6, transparent: true, opacity: 0.7 });
  const water = new THREE.Mesh(waterGeo, waterMat);
  water.position.y = -0.5;
  scene.add(water);
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
    type: config.player, scale: isDog ? 1.5 : 1.0 
  });
  
  for (let i = 0; i < 15; i++) {
    const id = world.createEntity();
    world.addComponent(id, Transform, { x: (Math.random()-0.5)*40 - 50, z: (Math.random()-0.5)*40 }); // Spawn away from yard
    world.addComponent(id, Velocity, { maxSpeed: 0.5 });
    
    const isSheep = config.herd === 'SHEEP';
    world.addComponent(id, CACBrainComponent, { 
      role: config.herd,
      fearBias: isSheep ? 1.5 : 0.8,
      socialBias: isSheep ? 2.0 : 0.5
    });
    world.addComponent(id, MeshComponent, { 
      type: config.herd, scale: isSheep ? 1.2 : 0.8
    });
  }
  
  // Build the Yard Fences
  const yardX = 80, yardZ = 80, yardR = 30;
  // Loop to 14 instead of 16 to leave a 2-segment wide gap (gate)
  for (let i = 0; i < 14; i++) {
    const angle = (i / 16) * Math.PI * 2;
    const fx = yardX + Math.cos(angle) * yardR;
    const fz = yardZ + Math.sin(angle) * yardR;
    const fenceId = world.createEntity();
    // Fix rotation so fences are tangential to the circle
    world.addComponent(fenceId, Transform, { x: fx, z: fz, rotationY: -angle + Math.PI / 2 });
    world.addComponent(fenceId, MeshComponent, { type: 'FENCE' });
  }

  if (config.adv === 'ALIEN') {
    const alienId = world.createEntity();
    world.addComponent(alienId, Transform, { x: 0, z: -50, hoverHeight: 12 });
    world.addComponent(alienId, Velocity, { maxSpeed: 1.5 });
    world.addComponent(alienId, CACBrainComponent, { role: 'ALIEN' });
    world.addComponent(alienId, ActionState);
    world.addComponent(alienId, MeshComponent, { type: 'cylinder', color: 0x9333ea, scale: 3.0 });
  } else if (config.adv === 'BORDER_COLLIE') {
    const collieId = world.createEntity();
    world.addComponent(collieId, Transform, { x: 0, z: -40 });
    world.addComponent(collieId, Velocity, { maxSpeed: 1.0 });
    world.addComponent(collieId, CACBrainComponent, { role: 'BORDER_COLLIE' });
    world.addComponent(collieId, ActionState);
    world.addComponent(collieId, MeshComponent, { type: 'BORDER_COLLIE', scale: 1.5 });
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
      mesh = new THREE.Group();
      if (mComp.type === 'SHEEP') {
        const bodyGeo = new THREE.DodecahedronGeometry(1.2, 1);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xffffff });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1; body.castShadow = true;
        mesh.add(body);
        const legGeo = new THREE.CylinderGeometry(0.2, 0.2, 1);
        const legMat = new THREE.MeshLambertMaterial({ color: 0x111111 });
        for(let j=0; j<4; j++) {
           const leg = new THREE.Mesh(legGeo, legMat);
           leg.position.set(j%2===0?0.6:-0.6, 0.5, j<2?0.6:-0.6);
           leg.castShadow = true;
           mesh.add(leg);
        }
      } else if (mComp.type === 'CAT') {
        const bodyGeo = new THREE.BoxGeometry(1, 1, 2);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xf97316 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.5; body.castShadow = true;
        mesh.add(body);
        const earGeo = new THREE.ConeGeometry(0.3, 0.6);
        const earL = new THREE.Mesh(earGeo, bodyMat); earL.position.set(-0.3, 1.2, 0.8);
        const earR = new THREE.Mesh(earGeo, bodyMat); earR.position.set(0.3, 1.2, 0.8);
        mesh.add(earL, earR);
      } else if (mComp.type === 'SHEEPDOG' || mComp.type === 'BORDER_COLLIE') {
        const color = mComp.type === 'BORDER_COLLIE' ? 0x222222 : 0xf5f5f4;
        const bodyGeo = new THREE.BoxGeometry(1.5, 1.5, 3);
        const bodyMat = new THREE.MeshLambertMaterial({ color: color });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.75; body.castShadow = true;
        mesh.add(body);
        const snoutGeo = new THREE.BoxGeometry(1, 1, 1);
        const snout = new THREE.Mesh(snoutGeo, bodyMat);
        snout.position.set(0, 1.5, 1.8);
        mesh.add(snout);
      } else if (mComp.type === 'HAMSTER') {
        const bodyGeo = new THREE.SphereGeometry(1);
        const bodyMat = new THREE.MeshLambertMaterial({ color: 0xd97706 });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 1.0; body.castShadow = true;
        mesh.add(body);
      } else if (mComp.type === 'FENCE') {
        const postGeo = new THREE.BoxGeometry(0.5, 3, 0.5);
        const railGeo = new THREE.BoxGeometry(12, 0.5, 0.2);
        const woodMat = new THREE.MeshLambertMaterial({ color: 0x8b5a2b });
        const post = new THREE.Mesh(postGeo, woodMat); post.position.y = 1.5;
        const rail1 = new THREE.Mesh(railGeo, woodMat); rail1.position.set(6, 1.0, 0);
        const rail2 = new THREE.Mesh(railGeo, woodMat); rail2.position.set(6, 2.0, 0);
        mesh.add(post, rail1, rail2);
      } else if (mComp.type === 'cylinder') {
        const geo = new THREE.CylinderGeometry(1, 1, 0.3, 16);
        const mat = new THREE.MeshLambertMaterial({ color: mComp.color });
        const c = new THREE.Mesh(geo, mat); c.castShadow = true;
        mesh.add(c);
      } else {
        const geo = new THREE.BoxGeometry();
        const mat = new THREE.MeshLambertMaterial({ color: mComp.color });
        const b = new THREE.Mesh(geo, mat); b.castShadow = true;
        mesh.add(b);
      }
      
      mesh.scale.setScalar(mComp.scale);
      scene.add(mesh);
      meshMap.set(id, mesh);
    }
    
    mesh.position.set(trans.x, trans.y, trans.z);
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
  
  // Render Adversary AoE if any
  const advBrains = world.query([CACBrainComponent, ActionState, Transform]);
  for (const id of advBrains) {
    const b = world.getComponent(id, CACBrainComponent);
    if (b.role === 'ALIEN' || b.role === 'BORDER_COLLIE') {
      const a = world.getComponent(id, ActionState);
      const t = world.getComponent(id, Transform);
      if (a.isActive) {
        aoeMesh.visible = true;
        const hover = t.hoverHeight || 0;
        aoeMesh.position.set(t.x, t.y - hover + 0.1, t.z); // on the ground
        const s = a.radius;
        aoeMesh.scale.set(s, s, s);
        
        if (a.type === 'CHAOS_BEAM') {
          aoeMesh.material.color.setHex(0xd946ef); // Magenta
        } else if (a.type === 'BARK') {
          aoeMesh.material.color.setHex(0xff3333); // Red
        }
        
        aoeMesh.material.opacity = 1.0 - (a.radius / a.maxRadius);
      }
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
  const updateInfo = () => { document.getElementById('hud').textContent = `WASD: Move | SPACE: Action | V: ${GlobalState.cameraMode}`; };
  updateInfo();
  
  window.addEventListener('keydown', e => { 
    if (['w','a','s','d','q','e',' '].includes(e.key.toLowerCase())) e.preventDefault();
    const k = e.key.toLowerCase(); 
    if (Keys.hasOwnProperty(k)) Keys[k] = true; 
    if (k === ' ') Keys.space = true;
    if (k === 'v') {
      const modes = ['3RD', '1ST', 'TOP', 'SLEW'];
      GlobalState.cameraMode = modes[(modes.indexOf(GlobalState.cameraMode) + 1) % modes.length];
      updateInfo();
    }
  });
  window.addEventListener('keyup', e => { 
    if (['w','a','s','d','q','e',' '].includes(e.key.toLowerCase())) e.preventDefault();
    const k = e.key.toLowerCase(); 
    if (Keys.hasOwnProperty(k)) Keys[k] = false; 
    if (k === ' ') Keys.space = false;
  });
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
  
  loop();
};
