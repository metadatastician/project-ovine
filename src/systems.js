import { Transform, Velocity, CACBrainComponent, PlayerController, ActionState, MeshComponent } from './components.js';

export const GlobalState = { 
  cameraMode: '3RD', 
  slewPos: { x: 0, y: 30, z: 30 },
  slewRot: { x: -Math.PI/4, y: 0 },
  telemetry: null // For HUD
};

export function PhysicsSystem(world, dt) {
  const entities = world.query([Transform, Velocity]);
  for (const id of entities) {
    const transform = world.getComponent(id, Transform);
    const vel = world.getComponent(id, Velocity);
    
    const speed = Math.hypot(vel.vx, vel.vz);
    if (speed > vel.maxSpeed) {
      vel.vx = (vel.vx / speed) * vel.maxSpeed;
      vel.vz = (vel.vz / speed) * vel.maxSpeed;
    }
    
    transform.x += vel.vx * dt * 60;
    transform.z += vel.vz * dt * 60;
    
    const surfaceY = Math.sin(transform.x * 0.05) * Math.cos(transform.z * 0.05) * 4;
    transform.y = surfaceY;

    vel.vx *= vel.drag;
    vel.vz *= vel.drag;
    
    if (speed > 0.05) {
      const targetRot = Math.atan2(vel.vx, vel.vz);
      transform.rotationY += (targetRot - transform.rotationY) * 0.2; 
    }
  }
}

export function CACSystem(world, dt) {
  const brains = world.query([Transform, Velocity, CACBrainComponent]);
  const players = world.query([Transform, PlayerController, ActionState]);
  
  let pX = -90, pZ = -90, pAction = null;
  if (players.length > 0) {
    const pTrans = world.getComponent(players[0], Transform);
    pX = pTrans.x; pZ = pTrans.z;
    pAction = world.getComponent(players[0], ActionState);
  }
  
  let closestDist = Infinity;
  let closestBrain = null;

  for (const id of brains) {
    const trans = world.getComponent(id, Transform);
    const vel = world.getComponent(id, Velocity);
    const brain = world.getComponent(id, CACBrainComponent);
    
    const dist = Math.hypot(trans.x - pX, trans.z - pZ);
    
    // Telemetry tracking
    if (dist < closestDist) {
      closestDist = dist;
      closestBrain = brain;
    }

    // 1. Affective Parsing (Proximity & Active Events)
    if (pAction && pAction.isActive && dist < pAction.radius) {
      // Direct Event Injection
      if (pAction.type === 'BARK') {
        brain.fear = Math.min(1.0, brain.fear + 0.5 * brain.fearBias); // Massive fear spike
      } else if (pAction.type === 'SQUEAK') {
        brain.curiosity = Math.min(1.0, brain.curiosity + 0.3 * brain.socialBias); // Massive curiosity spike
      }
    } else if (dist < 30) {
      // Passive proximity
      brain.fear = Math.min(1.0, brain.fear + dt * 0.5 * brain.fearBias);
    } else {
      // Natural decay
      brain.fear = Math.max(0.0, brain.fear - dt * 0.2);
      brain.curiosity = Math.max(0.0, brain.curiosity - dt * 0.2);
    }
    
    // 2. Conative Arbitration (Goal Selection)
    if (brain.fear > 0.5) {
      brain.goal = 'FLEE';
    } else if (brain.curiosity > 0.4) {
      brain.goal = 'INVESTIGATE';
    } else if (brain.role === 'ALIEN') {
      brain.goal = 'HACK_GATE';
    } else {
      brain.goal = 'WANDER';
    }
    
    // 3. Actuation Vector Calculation
    let ax = 0, az = 0;
    if (brain.goal === 'FLEE') {
      const dx = trans.x - pX;
      const dz = trans.z - pZ;
      const l = Math.hypot(dx, dz) || 1;
      ax += (dx / l) * 1.5;
      az += (dz / l) * 1.5;
    } else if (brain.goal === 'INVESTIGATE') {
      const dx = pX - trans.x;
      const dz = pZ - trans.z;
      const l = Math.hypot(dx, dz) || 1;
      // Approach slowly
      ax += (dx / l) * 0.5;
      az += (dz / l) * 0.5;
    } else if (brain.goal === 'WANDER') {
      ax += (Math.random() - 0.5) * 0.3;
      az += (Math.random() - 0.5) * 0.3;
    } else if (brain.goal === 'HACK_GATE') {
      const dx = 0 - trans.x;
      const dz = 0 - trans.z;
      const l = Math.hypot(dx, dz) || 1;
      ax += (dx / l) * 1.0;
      az += (dz / l) * 1.0;
    }
    
    vel.vx += ax * dt * 4.0;
    vel.vz += az * dt * 4.0;
  }

  if (closestBrain) {
    GlobalState.telemetry = closestBrain;
  } else {
    GlobalState.telemetry = null;
  }
}

export const Keys = { w:false, a:false, s:false, d:false, q:false, e:false, space:false };

export function PlayerInputSystem(world, dt) {
  if (GlobalState.cameraMode === 'SLEW') {
    const slewSpeed = 0.5;
    let ax = 0, az = 0;
    if (Keys.w) az -= slewSpeed;
    if (Keys.s) az += slewSpeed;
    if (Keys.a) ax -= slewSpeed;
    if (Keys.d) ax += slewSpeed;
    if (Keys.q) GlobalState.slewRot.y += 0.05;
    if (Keys.e) GlobalState.slewRot.y -= 0.05;

    GlobalState.slewPos.x += ax * Math.cos(GlobalState.slewRot.y) + az * Math.sin(GlobalState.slewRot.y);
    GlobalState.slewPos.z += az * Math.cos(GlobalState.slewRot.y) - ax * Math.sin(GlobalState.slewRot.y);
    return;
  }

  const players = world.query([Transform, Velocity, PlayerController, ActionState]);
  for (const id of players) {
    const vel = world.getComponent(id, Velocity);
    const trans = world.getComponent(id, Transform);
    const ctrl = world.getComponent(id, PlayerController);
    const action = world.getComponent(id, ActionState);
    const accel = 0.15;
    
    // Action Logic (Spacebar)
    if (Keys.space && !action.isActive) {
      action.isActive = true;
      action.radius = 0;
      action.type = ctrl.role === 'SHEEPDOG' ? 'BARK' : 'SQUEAK';
      action.maxRadius = ctrl.role === 'SHEEPDOG' ? 40 : 20;
    }
    
    if (action.isActive) {
      action.radius += dt * 100; // Shockwave expands rapidly
      if (action.radius > action.maxRadius) {
        action.isActive = false;
      }
    }

    let ax = 0, az = 0;
    if (GlobalState.cameraMode === 'TOP') {
      if (Keys.w) az -= accel;
      if (Keys.s) az += accel;
      if (Keys.a) ax -= accel;
      if (Keys.d) ax += accel;
    } else {
      if (Keys.w) {
        ax += Math.sin(trans.rotationY) * accel;
        az += Math.cos(trans.rotationY) * accel;
      }
      if (Keys.s) {
        ax -= Math.sin(trans.rotationY) * accel;
        az -= Math.cos(trans.rotationY) * accel;
      }
      if (Keys.a) trans.rotationY += 0.08;
      if (Keys.d) trans.rotationY -= 0.08;
    }

    vel.vx += ax;
    vel.vz += az;
  }
}
