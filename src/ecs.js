export class World {
  constructor() {
    this.entities = new Map();
    this.nextEntityId = 1;
    this.systems = [];
  }

  createEntity() {
    const id = this.nextEntityId++;
    this.entities.set(id, new Map());
    return id;
  }

  destroyEntity(id) {
    this.entities.delete(id);
  }

  addComponent(entityId, ComponentClass, data = {}) {
    const components = this.entities.get(entityId);
    if (!components) return;
    const instance = new ComponentClass(data);
    components.set(ComponentClass.name, instance);
    return instance;
  }

  getComponent(entityId, ComponentClass) {
    const components = this.entities.get(entityId);
    return components ? components.get(ComponentClass.name) : undefined;
  }

  hasComponent(entityId, ComponentClass) {
    const components = this.entities.get(entityId);
    return components ? components.has(ComponentClass.name) : false;
  }

  query(componentClasses) {
    const matches = [];
    for (const [entityId, components] of this.entities.entries()) {
      let hasAll = true;
      for (const cls of componentClasses) {
        if (!components.has(cls.name)) {
          hasAll = false;
          break;
        }
      }
      if (hasAll) matches.push(entityId);
    }
    return matches;
  }

  addSystem(systemFunc) {
    this.systems.push(systemFunc);
  }

  tick(dt) {
    for (const sys of this.systems) {
      sys(this, dt);
    }
  }
}
