export class Transform {
  constructor(data) {
    this.x = data.x || 0;
    this.y = data.y || 0;
    this.z = data.z || 0;
    this.rotationY = data.rotationY || 0;
    this.hoverHeight = data.hoverHeight || 0;
  }
}

export class Velocity {
  constructor(data) {
    this.vx = data.vx || 0;
    this.vz = data.vz || 0;
    this.maxSpeed = data.maxSpeed || 0.4;
    this.drag = data.drag || 0.92;
  }
}

export class PlayerController {
  constructor(data) {
    this.role = data.role || 'HAMSTER'; 
  }
}

export class ActionState {
  constructor() {
    this.isActive = false;
    this.radius = 0;
    this.maxRadius = 30;
    this.type = 'NONE'; // 'BARK', 'SQUEAK', 'CHAOS_BEAM'
  }
}

export class CACBrainComponent {
  constructor(data) {
    this.role = data.role || 'CAT'; 
    this.goal = 'WANDER';
    
    this.fearBias = data.fearBias || 1.0;
    this.socialBias = data.socialBias || 1.0;
    
    this.fear = 0.0;
    this.trust = 0.0;
    this.curiosity = 0.0;
  }
}

export class MeshComponent {
  constructor(data) {
    this.type = data.type || 'SHEEP'; // 'SHEEP', 'CAT', 'DOG', 'HAMSTER', 'ALIEN', 'BORDER_COLLIE', 'FENCE'
    this.color = data.color || 0xffffff;
    this.mesh = null; 
    this.scale = data.scale || 1.0;
  }
}
