import { Transform, Velocity, CACBrainComponent, PlayerController, ActionState, MeshComponent } from './components.js';

export const GlobalState = { 
  cameraMode: '3RD', 
  slewPos: { x: 0, y: 30, z: 30 },
  slewRot: { x: -Math.PI/4, y: 0 },
  telemetry: null // For HUD
};

export function PhysicsSystem(world, dt) {
  const movers = world.query([Transform, Velocity]);
  const allTransforms = world.query([Transform]);
  
  for (const id of movers) {
    const transform = world.getComponent(id, Transform);
    const vel = world.getComponent(id, Velocity);
    
    // Entity vs Entity Collision
    for (const other of allTransforms) {
      if (id === other) continue;
      const tOther = world.getComponent(other, Transform);
      // Skip static objects like FENCE that don't have Velocity if we handle them specially
      const vOther = world.getComponent(other, Velocity);
      if (!vOther) continue; // Only collide dynamic entities with dynamic entities
      
      const ex = transform.x - tOther.x;
      const ez = transform.z - tOther.z;
      const edist = Math.hypot(ex, ez);
      if (edist > 0 && edist < 2.0) {
        const push = (2.0 - edist) / 2;
        transform.x += (ex / edist) * push;
        transform.z += (ez / edist) * push;
        tOther.x -= (ex / edist) * push;
        tOther.z -= (ez / edist) * push;
      }
    }
    
    // Fence Collision (Yard at 80, 80, radius 30)
    const dx = transform.x - 80;
    const dz = transform.z - 80;
    const distToYard = Math.hypot(dx, dz);
    if (distToYard > 28 && distToYard < 32) {
      const angle = Math.atan2(dz, dx);
      // Gap is roughly between -1.0 and -0.1 rad
      if (angle < -1.0 || angle > -0.1) {
        if (distToYard < 30) {
          transform.x = 80 + (dx / distToYard) * 28;
          transform.z = 80 + (dz / distToYard) * 28;
        } else {
          transform.x = 80 + (dx / distToYard) * 32;
          transform.z = 80 + (dz / distToYard) * 32;
        }
        vel.vx *= 0.8; vel.vz *= 0.8;
      }
    }
    
    const speed = Math.hypot(vel.vx, vel.vz);
    if (speed > vel.maxSpeed) {
      vel.vx = (vel.vx / speed) * vel.maxSpeed;
      vel.vz = (vel.vz / speed) * vel.maxSpeed;
    }
    
    transform.x += vel.vx * dt * 60;
    transform.z += vel.vz * dt * 60;
    
    // Map Boundaries
    transform.x = Math.max(-140, Math.min(140, transform.x));
    transform.z = Math.max(-140, Math.min(140, transform.z));
    
    // Complex Terrain Logic (River + Hills)
    const distFromRiver = Math.abs(transform.x);
    const riverDip = Math.max(0, 20 - distFromRiver) * -0.5; // dip down in the middle
    const hill = Math.sin(transform.x * 0.02) * Math.cos(transform.z * 0.02) * 15;
    
    const surfaceY = Math.max(riverDip + hill, -1.5); // Ensure surface doesn't go infinitely deep
    transform.y = surfaceY + transform.hoverHeight;

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
  
  let pX = -90, pZ = -90;
  if (players.length > 0) {
    const pTrans = world.getComponent(players[0], Transform);
    pX = pTrans.x; pZ = pTrans.z;
  }

  // Find adversaries
  const brainsForAlien = world.query([Transform, Velocity, CACBrainComponent]);
  for (const id of brainsForAlien) {
    const b = world.getComponent(id, CACBrainComponent);
    if (b.role === 'ALIEN' || b.role === 'BORDER_COLLIE') {
      const advAction = world.getComponent(id, ActionState);
      
      // Expand Adversary Action
      if (advAction && advAction.isActive) {
        advAction.radius += dt * 80;
        if (advAction.radius > advAction.maxRadius) {
          advAction.isActive = false;
        }
      }
    }
  }

  // Find herd center for targeting
  let hX = 0, hZ = 0, hCount = 0;
  for (const id of brains) {
    const b = world.getComponent(id, CACBrainComponent);
    if (b.role !== 'ALIEN' && b.role !== 'BORDER_COLLIE') {
      const t = world.getComponent(id, Transform);
      hX += t.x; hZ += t.z;
      hCount++;
    }
  }
  if (hCount > 0) { hX /= hCount; hZ /= hCount; }
  
  // Collect all active actions in the world
  const activeActions = [];
  const actionEntities = world.query([ActionState, Transform]);
  for (const id of actionEntities) {
    const a = world.getComponent(id, ActionState);
    if (a.isActive) {
      const t = world.getComponent(id, Transform);
      activeActions.push({ x: t.x, z: t.z, action: a });
    }
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
    let hitByChaos = false;
    let eventHandled = false;
    
    for (const act of activeActions) {
      const distToAction = Math.hypot(trans.x - act.x, trans.z - act.z);
      if (distToAction < act.action.radius) {
        if (act.action.type === 'CHAOS_BEAM') {
          hitByChaos = true;
          brain.fear = 1.0; // Panic!
          eventHandled = true;
        } else if (act.action.type === 'BARK') {
          brain.fear = Math.min(1.0, brain.fear + 0.5 * brain.fearBias); // Massive fear spike
          eventHandled = true;
        } else if (act.action.type === 'SQUEAK') {
          brain.curiosity = Math.min(1.0, brain.curiosity + 0.3 * brain.socialBias); // Massive curiosity spike
          eventHandled = true;
        }
      }
    }
    
    if (!eventHandled) {
      if (dist < 30) {
        // Passive proximity to player
        brain.fear = Math.min(1.0, brain.fear + dt * 0.5 * brain.fearBias);
      } else {
        // Natural decay
        brain.fear = Math.max(0.0, brain.fear - dt * 0.2);
        brain.curiosity = Math.max(0.0, brain.curiosity - dt * 0.2);
      }
    }
    
    if (hitByChaos) {
      vel.vx += (Math.random() - 0.5) * 8.0; // Tuned down from 15
      vel.vz += (Math.random() - 0.5) * 8.0;
    }
    
    // Yard Logic
    const inYard = Math.hypot(trans.x - 80, trans.z - 80) < 30;
    if (inYard && (brain.role === 'SHEEP' || brain.role === 'CAT')) {
      brain.fear = 0;
      brain.curiosity = 0;
      brain.goal = 'REST';
    } else {
      // 2. Conative Arbitration (Goal Selection)
      if (brain.fear > 0.5) {
        brain.goal = 'FLEE';
      } else if (brain.curiosity > 0.4) {
        brain.goal = 'INVESTIGATE';
      } else if (brain.role === 'ALIEN') {
        brain.goal = 'HACK_GATE';
      } else if (brain.role === 'BORDER_COLLIE') {
        brain.goal = 'HERD_COMPETE';
      } else {
        brain.goal = 'WANDER';
      }
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
    } else if (brain.goal === 'REST') {
      // Stay put, slow down
      vel.vx *= 0.5;
      vel.vz *= 0.5;
    } else if (brain.goal === 'HACK_GATE' || brain.goal === 'HERD_COMPETE') {
      const dx = hX - trans.x;
      const dz = hZ - trans.z;
      const l = Math.hypot(dx, dz) || 1;
      ax += (dx / l) * 1.0;
      az += (dz / l) * 1.0;
      
      const advAct = world.getComponent(id, ActionState);
      if (brain.role === 'ALIEN') {
        // Auto-trigger chaos beam if close to herd center
        if (l < 15 && advAct && !advAct.isActive && Math.random() < 0.005) { // Tuned from 0.02
           advAct.isActive = true;
           advAct.radius = 0;
           advAct.maxRadius = 35;
           advAct.type = 'CHAOS_BEAM';
        }
      } else if (brain.role === 'BORDER_COLLIE') {
        // Auto-trigger bark if close to herd center
        if (l < 25 && advAct && !advAct.isActive && Math.random() < 0.05) {
           advAct.isActive = true;
           advAct.radius = 0;
           advAct.maxRadius = 40;
           advAct.type = 'BARK';
        }
      }
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
