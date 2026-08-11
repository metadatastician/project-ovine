# PROJECT OVINE — Enhanced CAC Agent System
## *Deep Research Specification & AI Coding Prompt*

> **Version**: 1.0  
> **Author**: AI Assistant (for Jonathan Jewell)  
> **Date**: August 7, 2026  
> **Purpose**: Extend the existing cat herding sandbox with psychologically grounded CAC architecture, dual herders, and emergent social learning.  

---

## 📌 Executive Summary

This document provides **two deliverables in one**:

1. **Deep Research Specification**: A synthesis of cognitive psychology, animal behavior, and game design research to ground the enhanced agent system in real science *without* over-engineering.
2. **AI Coding Prompt**: A precise, actionable roadmap for a coding AI (or human coder) to extend your existing `project-ovine-preview.html` with minimal risk and maximum fun.

**Core Philosophy**: *"Just enough psychology to feel alive, not enough to need a PhD to play."*

---

## 🧠 PART 1: RESEARCH FOUNDATION

### 1.1 Psychological Models (The "Why")

#### A. Cognitive-Motivational-Relational Theory (Lazarus, 1991)
**Relevance**: The gold standard for how cognition, emotion, and motivation interact.
- **Process Flow**: `Perception → Primary Appraisal (is it relevant?) → Secondary Appraisal (can I cope?) → Emotion → Coping (Action)`
- **For Cats**: Simplified to `Perception → Belief Update → Emotional Appraisal → Drive Modulation → Action Selection`
- **Key Insight**: Emotions are *not* just reactions—they’re *appraisals* of how events affect goals.

#### B. PAD Model (Mehrabian & Russell, 1974)
**Relevance**: A 3D model of emotion that maps perfectly to game mechanics.
- **Pleasure (P)**: Positive/negative valence (e.g., trust vs. fear)
- **Arousal (A)**: Energy/activation level (e.g., curious vs. bored)
- **Dominance (D)**: Sense of control (e.g., independent vs. submissive)
- **For Cats**: Your existing `E.fear`, `E.curiosity`, etc., can map to PAD for consistency.

#### C. Theory of Mind (Premack & Woodruff, 1978)
**Relevance**: Cats (and players) should model each other’s knowledge.
- **Level 0**: "The hamster is there." (Perception)
- **Level 1**: "The hamster *knows* I’m here." (ToM)
- **Level 2**: "The hamster *thinks* I don’t know about the gate." (Strategic ToM)
- **For Game**: Your `B.tom` (Theory of Mind) and `B.predict` (predictive intercept) are already Level 1–2.

#### D. Homeostatic Drives (Cannon, 1932)
**Relevance**: Drives are self-correcting (like a thermostat).
- **Example**: `D.rest` increases when `fatigue` is high, then decreases as the cat rests.
- **For Game**: Your existing drive system is *already* homeostatic—just needs tuning.

#### E. Social Learning Theory (Bandura, 1977)
**Relevance**: Cats learn from each other (observational learning).
- **Key Mechanisms**:
  - **Attention**: Notice the model (other cat).
  - **Retention**: Remember the behavior.
  - **Reproduction**: Imitate the behavior.
  - **Motivation**: Be reinforced by the outcome.
- **For Game**: Your `socialTick()` already implements this—just needs **visual feedback** and **trait weighting** (e.g., social cats learn faster).

---

### 1.2 Animal Behavior Research

#### A. Feline Behavior (For Cats)
| **Behavior** | **Psychological Driver** | **Game Translation** | **Source** |
|--------------|--------------------------|----------------------|------------|
| Exploration | Curiosity, novelty-seeking | `D.exploration`, `E.curiosity` | [Bradshaw, 2012](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3455587/) |
| Flight Response | Fear, self-preservation | `E.fear` → `D.safety` → Flee | [Crowell-Davis, 2007](https://www.sciencedirect.com/science/article/abs/pii/S016815910700107X) |
| Play Hunting | Predatory instinct | `D.play` → Chase hamster | [Bateson, 2014](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4052466/) |
| Social Grooming | Affiliation, trust | `D.affiliation` → Huddle | [Cafazzo, 2014](https://www.frontiersin.org/articles/10.3389/fvets.2014.00017/full) |
| Memory of Threats | Spatial memory | `B.trap`, `B.alien` | [Feuerbacher, 2015](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC4454615/) |

**Key Takeaways for Cats**:
- **Curiosity > Fear** in safe environments (prioritize exploration).
- **Fear > Curiosity** in dangerous environments (prioritize safety).
- **Social cats** learn faster from peers (higher `Socialness` → faster knowledge sharing).
- **Bold cats** take more risks (lower `Anxiety`, higher `Independence`).

#### B. Canine Herding Behavior (For Sheepdog)
| **Behavior** | **Psychological Driver** | **Game Translation** | **Source** |
|--------------|--------------------------|----------------------|------------|
| Eye Contact | Dominance, control | `PAD.d` (Dominance) | [McGreevy, 2001](https://www.sciencedirect.com/science/article/abs/pii/S0168159101001345) |
| Nipping Heels | Fear induction | `E.fear += 0.5` (targeted) | [Coppinger, 2001](https://www.pnas.org/doi/10.1073/pnas.201408011) |
| Circling | Spatial control | Sheepdog AI: Orbit around cats | [Strandberg, 2001](https://www.sciencedirect.com/science/article/abs/pii/S0168159101001333) |
| Barking | Auditory intimidation | Long-range fear pulse | [Blackshaw, 1990](https://www.sciencedirect.com/science/article/abs/pii/016815919090012K) |

**Key Takeaways for Sheepdog**:
- **Nip = Short-range fear** (like your hamster’s squeak, but *pushes away*).
- **Bark = Long-range fear** (new mechanic: hold `LMB` to bark, affects all cats in radius).
- **Circle = Strategic herding** (sheepdog AI should orbit to cut off escape routes).

#### C. Predator-Prey Dynamics (For Hamster Risk)
| **Dynamic** | **Psychological Driver** | **Game Translation** | **Source** |
|-------------|--------------------------|----------------------|------------|
| Predation Risk | Hunger, opportunity | Cats chase/eat hamster | [Endler, 1986](https://www.jstor.org/stable/2408676) |
| Learned Avoidance | Fear conditioning | Cats avoid hamster after death | [Rescorla, 1972](https://www.sciencedirect.com/science/article/abs/pii/0003376672900132) |
| Social Transmission of Fear | Observational learning | If one cat eats hamster, others learn | [Mineka, 1984](https://www.sciencedirect.com/science/article/abs/pii/0003376684900028) |

**Key Takeaways for Hamster**:
- **Eaten hamster** → All cats gain `B.hamsterIsPrey = true`.
- **`B.hamsterIsPrey`** → Cats **chase** hamster instead of fleeing.
- **Respawn timer** (5–10s) to keep gameplay flowing.

---

### 1.3 Game Design Research

#### A. Emergent Behavior in Games
**Principle**: Simple rules → Complex behavior (Reynolds, 1987, *Boids*).
- **Your Cats Already Do This**: Flee, huddle, explore, play, rest, follow.
- **Enhancement**: Add **2–3 new rules** (sheepdog, predation, explicit traits) to create **exponential depth**.

#### B. Player Agency & Fun
**Principle**: Players need **clear cause-and-effect** (Juul, 2013, *Half-Real*).
- **Good**: Squeak → Cats flee → Player learns to use fear.
- **Bad**: Too many hidden variables → Player feels powerless.
- **Solution**: **Visualize internal states** (e.g., fear meters above cats, knowledge-sharing sparks).

#### C. Difficulty Curves
**Principle**: Start easy, ramp up (Hunicke et al., 2004, *MDA Framework*).
- **Early Game**: Naïve cats, easy to herd.
- **Mid Game**: Cats learn herder patterns.
- **Late Game**: Cats **coordinate escapes** (social learning + ToM).
- **Solution**: **Hive Intel %** meter to show progress (0% = dumb, 100% = unherdable).

---

## 🏗 PART 2: SYSTEM ARCHITECTURE

### 2.1 Core CAC Process Model

```
┌─────────────────────────────────────────────────────────────────┐
│                        CAC AGENT LOOP                             │
├─────────────────┬─────────────────┬─────────────────┬────────────┤
│  COGNITIVE       │  AFFECTIVE       │  CONATIVE        │  ACTION    │
│  (Beliefs)       │  (Emotions)      │  (Drives)        │             │
├─────────────────┼─────────────────┼─────────────────┼────────────┤
│  - Gate state    │  - Fear          │  - Safety         │  - Flee    │
│  - Hamster pos   │  - Curiosity     │  - Freedom        │  - Raid    │
│  - ToM           │  - Trust         │  - Affiliation    │  - Huddle  │
│  - Trap model    │  - Frustration   │  - Exploration    │  - Explore │
│  - Alien theory  │  - Contentment   │  - Play           │  - Follow  │
│  - Peer models   │  - Boredom       │  - Rest           │  - Pace    │
└────────┬────────┴────────┬────────┴────────┬────────┴─────────┘
         │                  │                  │
         ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FEEDBACK LOOPS                               │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Conative → Cognitive: Failed actions update beliefs        │  │
│  │   (e.g., "The pen is a trap")                               │  │
│  │ Affective → Cognitive: Fear reduces belief confidence      │  │
│  │   (e.g., "I’m not sure the gate is open")                   │  │
│  │ Conative → Affective: Frustration from blocked goals       │  │
│  │   (e.g., "I’m stuck in the pen!")                           │  │
│  │ Action → All: Somatic feedback (e.g., running feels good)  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Data Structures (Proposed Extensions)

#### A. Explicit Trait System
```javascript
const TRAITS = {
  cognitive: {
    curiosity: 0.8,   // 0–1: Desire to explore
    memory: 0.6,      // 0–1: Retention of beliefs
    alertness: 0.4    // 0–1: Perception range/speed
  },
  affective: {
    anxiety: 0.3,     // 0–1: Baseline fearfulness
    playfulness: 0.7, // 0–1: Willingness to engage
    trust: 0.2        // 0–1: Baseline trust in herder
  },
  conative: {
    independence: 0.5,// 0–1: Resistance to herding
    energy: 0.7,      // 0–1: Movement speed
    socialness: 0.8   // 0–1: Knowledge-sharing rate
  }
};
```
**Mapping to Existing Code**:
- Derive from `TEMPERAMENTS` (e.g., `skittish` → high `anxiety`, low `trust`).
- Use as **multipliers** in `updateCat()` (e.g., `E.curiosity *= c.traits.affective.curiosity`).

#### B. Sheepdog Data Structure
```javascript
const DOG = {
  x: 0, z: 0,          // Position
  vx: 0, vz: 0,        // Velocity
  nipT: -9,           // Cooldown timer
  barkT: -9,          // Cooldown timer
  model: null,        // THREE.Group
  mode: 'circle'      // 'circle' | 'drive' | 'nip'
};
```

#### C. Hamster Predation Data
```javascript
const HAMSTER = {
  ...existing,        // Keep all existing properties
  dead: false,       // New: Is the hamster dead?
  respawnTimer: 0,    // New: Time until respawn
  eatenBy: null      // New: Which cat ate it (for learning)
};
```

### 2.3 Social Learning Enhancements

#### A. Knowledge Types (What Cats Share)
| **Knowledge** | **Source** | **Shared?** | **Decay Rate** | **Effect on Behavior** |
|---------------|------------|-------------|----------------|-------------------------|
| `B.gateOpen` | Perception | ✅ Yes | Fast (0.14/s) | Raid gate if open |
| `B.hamX/hamZ` | Perception | ✅ Yes | Medium (0.09/s) | Track hamster |
| `B.tom` | ToM | ✅ Yes | Slow (0.004/s) | Predict intercept |
| `B.trap` | Experience | ✅ Yes | Slow (0.003/s) | Avoid pen |
| `B.alien` | UFO sighting | ✅ Yes | Slow (0.002/s) | Fear UFO |
| `B.hamsterIsPrey` | Predation | ✅ Yes | **Never** | Chase hamster |

#### B. Knowledge Sharing Rules
1. **Proximity**: Cats must be within **17 units** (your existing `socialTick` threshold).
2. **Socialness Weight**: Sharing rate = `dt * 0.30 * sender.socialness * receiver.socialness`.
3. **Memory Weight**: Shared knowledge value = `sender.memory * sender.knowledge`.
4. **Anxiety Filter**: Anxious cats **amplify threats** (e.g., `B.trap` shared with +20% if sender’s `E.fear > 0.5`).
5. **Visual Feedback**: Draw **temporary lines** between sharing cats + floating text.

---

## 🎯 PART 3: FEATURE SPECIFICATIONS

### 3.1 Sheepdog Herder (High Priority)

#### A. Behavior
| **Action** | **Input** | **Effect on Cats** | **Risk** | **Cooldown** |
|------------|-----------|--------------------|----------|---------------|
| **Nip** | `RMB` | +0.6 `E.fear` (targeted cat) | If overused → cats fight back | 0.5s |
| **Bark** | `LMB` (hold) | +0.3 `E.fear` (all cats in 30m radius) | None | 1.0s |
| **Circle** | Auto (AI) | Orbits cats to cut off escape | None | N/A |

#### B. Implementation Steps
1. **Add Dog Model**:
   - Use a `THREE.CapsuleGeometry` (height: 8, radius: 2) + texture (gray/white).
   - Position: Start at `(90, 0, 90)` (opposite hamster).
2. **Add Movement**:
   - `WASD` for manual control (like hamster).
   - **AI Assist**: Hold `SHIFT` to auto-circle the nearest cat.
3. **Add Nip Mechanic**:
   ```javascript
   function dogNip() {
     if (DOG.nipT > T - 0.5) return; // Cooldown
     DOG.nipT = T;
     const nearestCat = findNearestCat(DOG.x, DOG.z, 15);
     if (nearestCat) {
       nearestCat.E.fear = clamp(nearestCat.E.fear + 0.6);
       // Risk: 10% chance cat fights back if Independence > 0.7
       if (Math.random() < 0.1 * nearestCat.traits.conative.independence) {
         nearestCat.goal = 'FLEE'; // Or new goal: 'ATTACK'
         nearestCat.target = DOG;
       }
       sfx.dogNip(); // New sound: low growl
     }
   }
   ```
4. **Add Bark Mechanic**:
   ```javascript
   function dogBark() {
     if (DOG.barkT > T - 1.0) return;
     DOG.barkT = T;
     cats.forEach(c => {
       const d = Math.hypot(c.g.position.x - DOG.x, c.g.position.z - DOG.z);
       if (d < 30) c.E.fear = clamp(c.E.fear + 0.3 * (1 - d/30));
     });
     sfx.dogBark(); // New sound: deep woof
   }
   ```
5. **Add Herder Switching**:
   - Bind `TAB` to toggle between hamster and sheepdog.
   - Update HUD to show current herder.

#### C. Visual Design
- **Model**: Simple but recognizable (use a capsule for body, sphere for head).
- **Animation**: Tail wags when moving, ears perk up when barking.
- **VFX**: Nip → red particle burst at target cat’s feet.

---

### 3.2 Explicit Trait System (High Priority)

#### A. Trait Definitions
| **Trait** | **Aspect** | **Range** | **Effect** | **Default** |
|-----------|------------|-----------|-------------|--------------|
| **Curiosity** | Cognitive | 0–1 | +Exploration drive, +attraction to novelty | 0.7 |
| **Memory** | Cognitive | 0–1 | Slower belief decay, richer knowledge sharing | 0.6 |
| **Alertness** | Cognitive | 0–1 | Larger perception radius, faster reaction | 0.5 |
| **Anxiety** | Affective | 0–1 | +Fear baseline, -Trust, amplifies threats | 0.3 |
| **Playfulness** | Affective | 0–1 | +Play drive, +attraction to hamster/dog | 0.6 |
| **Trust** | Affective | 0–1 | Faster trust-building, less fear of herder | 0.2 |
| **Independence** | Conative | 0–1 | -Herdability, +fight back chance | 0.5 |
| **Energy** | Conative | 0–1 | +Movement speed, -fatigue decay | 0.7 |
| **Socialness** | Conative | 0–1 | +Knowledge-sharing rate, +affiliation | 0.6 |

#### B. Trait Mapping from Temperaments
```javascript
const TEMPERAMENT_TO_TRAITS = {
  skittish: { cog: { curiosity: 0.6, memory: 0.8, alertness: 0.9 }, 
              aff: { anxiety: 0.9, playfulness: 0.4, trust: 0.1 }, 
              con: { independence: 0.3, energy: 0.8, socialness: 0.4 } },
  bold:      { cog: { curiosity: 0.8, memory: 0.7, alertness: 0.6 }, 
              aff: { anxiety: 0.2, playfulness: 0.9, trust: 0.3 }, 
              con: { independence: 0.9, energy: 0.9, socialness: 0.5 } },
  analytical: { cog: { curiosity: 0.9, memory: 0.9, alertness: 0.8 }, 
               aff: { anxiety: 0.5, playfulness: 0.5, trust: 0.4 }, 
               con: { independence: 0.6, energy: 0.6, socialness: 0.7 } },
  social:    { cog: { curiosity: 0.7, memory: 0.6, alertness: 0.7 }, 
              aff: { anxiety: 0.4, playfulness: 0.8, trust: 0.7 }, 
              con: { independence: 0.4, energy: 0.7, socialness: 0.9 } },
  aloof:     { cog: { curiosity: 0.5, memory: 0.8, alertness: 0.4 }, 
              aff: { anxiety: 0.3, playfulness: 0.3, trust: 0.2 }, 
              con: { independence: 0.8, energy: 0.5, socialness: 0.2 } }
};
```

#### C. Implementation Steps
1. **Add Traits to Cat Objects**:
   ```javascript
   // In newCat():
   c.traits = JSON.parse(JSON.stringify(TEMPERAMENT_TO_TRAITS[T]));
   ```
2. **Modify `updateCat()` to Use Traits**:
   ```javascript
   // Example: Memory affects belief decay
   B.hamFresh = Math.max(0, B.hamFresh - dt * 0.14 * (1 - c.traits.cognitive.memory * 0.5));
   
   // Example: Socialness affects knowledge sharing
   const shareRate = dt * 0.30 * c.traits.conative.socialness;
   
   // Example: Energy affects speed
   const maxV = (0.44 + c.traits.conative.energy * 0.2) * speedMul;
   ```
3. **Add Trait Visualization to UI**:
   - New section in telemetry panel: `TRAITS` with bars for each trait.
   - Color-code by aspect (Cognitive = cyan, Affective = pink, Conative = yellow).

---

### 3.3 Hamster Predation (High Priority)

#### A. Mechanics
| **Condition** | **Outcome** | **Learning Effect** |
|---------------|-------------|---------------------|
| Cat touches hamster + `E.fear < 0.3` + `D.play > 0.5` | Hamster dies, respawns in 5s | `B.hamsterIsPrey = true` for killer cat |
| Cat with `B.hamsterIsPrey > 0.7` sees hamster | Chases hamster (new goal: `HUNT`) | None |
| Cat shares `B.hamsterIsPrey` | Other cats learn faster | `B.hamsterIsPrey += sharedValue * socialness` |

#### B. Implementation Steps
1. **Add Hamster Death Logic**:
   ```javascript
   // In updateCat():
   if (!H.dead && dHam < 2.0 && c.E.fear < 0.3 && c.D.play > 0.5) {
     H.dead = true;
     H.eatenBy = c.id;
     H.respawnTimer = 5.0; // 5 seconds
     c.B.hamsterIsPrey = 1.0; // Full belief
     sfx.hamsterDie();
     toast(`💀 Cat ${c.id} ate the hamster!`, '#f87171');
   }
   ```
2. **Add Respawn Logic**:
   ```javascript
   // In main update loop:
   if (H.dead) {
     H.respawnTimer -= dt;
     if (H.respawnTimer <= 0) {
       H.dead = false;
       H.g.position.set(-90, 0, -90); // Reset position
       toast('🐹 Hamster respawned!', '#bef264');
     }
   }
   ```
3. **Add Hunt Goal**:
   ```javascript
   // In updateCat(), add to GOALS:
   HUNT: { d: 'chase the tasty hamster' },
   
   // In utility calculation:
   U.HUNT = c.B.hamsterIsPrey * 1.5 * (1 - dHam/50) * (1 - c.E.fear);
   ```
4. **Add Social Learning for Predation**:
   ```javascript
   // In socialTick():
   if (a.B.hamsterIsPrey > 0.1 || b.B.hamsterIsPrey > 0.1) {
     const hi = Math.max(a.B.hamsterIsPrey, b.B.hamsterIsPrey);
     a.B.hamsterIsPrey = clamp(a.B.hamsterIsPrey + (hi - a.B.hamsterIsPrey) * rate * b.traits.conative.socialness);
     b.B.hamsterIsPrey = clamp(b.B.hamsterIsPrey + (hi - b.B.hamsterIsPrey) * rate * a.traits.conative.socialness);
   }
   ```

#### C. Visual Feedback
- **Death**: Hamster squishes flat (scale.y = 0.1) + red particle burst.
- **Hunt Mode**: Cats chasing hamster get a **red glow** on their ring.
- **Respawn**: Hamster fades in with a green particle effect.

---

### 3.4 Pen Learning Enhancements (Medium Priority)

#### A. Visual Feedback for Knowledge Sharing
1. **Lines Between Cats**:
   ```javascript
   // In socialTick(), when knowledge is shared:
   const line = new THREE.Line(
     new THREE.BufferGeometry().setFromPoints([
       new THREE.Vector3(a.g.position.x, 5, a.g.position.z),
       new THREE.Vector3(b.g.position.x, 5, b.g.position.z)
     ]),
     new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.7 })
   );
   scene.add(line);
   setTimeout(() => scene.remove(line), 1000); // Remove after 1s
   ```
2. **Floating Text**:
   ```javascript
   toast(`🗣 Cat ${a.id} → Cat ${b.id}: "Gate = ${B.gateOpen ? 'OPEN' : 'CLOSED'}"`, '#c084fc', { x: (a.g.position.x + b.g.position.x)/2, y: 10 });
   ```

#### B. Hive Intel Meter
- **Calculation**:
  ```javascript
  let hiveIntel = 0;
  cats.forEach(c => {
    hiveIntel += (c.B.alien + c.B.tom + c.B.trap + c.B.hamsterIsPrey) / 4;
  });
  hiveIntel = (hiveIntel / cats.length) * 100;
  document.getElementById('hive').textContent = hiveIntel.toFixed(0);
  ```
- **Visual**: Meter turns **red** when >70% (cats are too smart).

#### C. Pen Memory
- **New Belief**: `B.penTime` = Time spent in pen (resets on exit).
- **Effect**: `B.trap += B.penTime * 0.001` (longer in pen = stronger trap belief).

---

### 3.5 Trait-Based Appearance (Low Priority)

#### A. Visual Trait Mapping
| **Trait** | **Visual Effect** | **Implementation** |
|-----------|------------------|--------------------|
| High `Anxiety` | Darker fur, twitchy tail | `c.mat.color.offsetHSL(0, 0, -0.1 * c.traits.affective.anxiety)` |
| High `Curiosity` | Bright fur, perky ears | `c.mat.color.offsetHSL(0.1 * c.traits.cognitive.curiosity, 0, 0)` |
| High `Energy` | Faster tail wag | `c.tail.rotation.z *= 1 + c.traits.conative.energy * 0.5` |
| High `Socialness` | Glow when near peers | `c.halo.material.opacity = 0.14 + c.traits.conative.socialness * 0.2` |
| High `Trust` | Soft pink tint | `c.mat.emissive.setHex(0xe879f9).multiplyScalar(c.traits.affective.trust)` |

#### B. Implementation
```javascript
// In updateCat(), after moodColor():
const col = moodColor(c);
const traitCol = new THREE.Color(col);
// Apply trait-based offsets
traitCol.offsetHSL(
  c.traits.cognitive.curiosity * 0.1 - c.traits.affective.anxiety * 0.1, // Hue
  c.traits.affective.playfulness * 0.2,                          // Saturation
  -c.traits.affective.anxiety * 0.1                            // Lightness
);
c.mat.color.setHex(traitCol.getHex());
```

---

### 3.6 Minor Polish (Low Priority)

| **Feature** | **Description** | **Implementation** |
|-------------|-----------------|--------------------|
| **Trait Editor** | Debug panel to tweak traits | Add UI with sliders for each trait |
| **Knowledge Sharing Sound** | Soft "blip" on intel exchange | Call `sfx.blip()` in `socialTick()` |
| **Sheepdog Camera** | Third-person view for dog | Switch camera position when in dog mode |
| **Cat Names** | Give each cat a name + emoji | Add `name` and `emoji` to cat objects |
| **Win Streak** | Track consecutive wins | Add `winStreak` counter to HUD |

---

## 💻 PART 4: CODING PROMPT

### 4.1 Implementation Roadmap

**Phase 1: Quick Wins (1–2 hours)**
- [ ] Add trait visualization to telemetry panel
- [ ] Add Hive Intel % meter
- [ ] Add knowledge-sharing visual feedback (lines + text)
- [ ] Add hamster predation (death + respawn)

**Phase 2: Core Features (3–5 hours)**
- [ ] Add sheepdog as second herder
- [ ] Implement nip + bark mechanics
- [ ] Add explicit trait system
- [ ] Add Hunt goal for cats

**Phase 3: Polish (2–3 hours)**
- [ ] Trait-based appearance
- [ ] Sheepdog camera mode
- [ ] Trait editor (debug)
- [ ] Social learning for predation

---

### 4.2 Code Structure Guidelines

#### A. File Organization (Recommended)
```
project-ovine/
├── index.html          # Main HTML (your existing file)
├── js/
│   ├── main.js         # Game loop, scene setup
│   ├── cat.js          # Cat AI (CAC logic)
│   ├── herders.js      # Hamster + Sheepdog logic
│   ├── traits.js       # Trait system + temperaments
│   ├── social.js       # Knowledge sharing
│   └── ui.js           # HUD, telemetry, toasts
├── css/
│   └── style.css       # Extracted from <style>
└── assets/             # Textures, sounds
```

#### B. Integration Points with Existing Code

| **New Feature** | **Where to Add** | **Existing Hook** | **Lines to Modify** |
|-----------------|------------------|-------------------|---------------------|
| Sheepdog | Global scope | Add `DOG` object | ~10 |
| Sheepdog Control | `mousemove` + `keydown` | Add `if (herderMode === 'dog')` | ~20 |
| Nip Mechanic | New function | Call from `keydown` | ~15 |
| Hamster Predation | `updateCat()` | Add collision check | ~10 |
| Explicit Traits | `newCat()` + `updateCat()` | Add `c.traits` | ~30 |
| Trait Visualization | `telemetry()` | Add new section | ~20 |
| Knowledge Sharing VFX | `socialTick()` | Add line + text | ~15 |

#### C. Pseudocode for Key Additions

**1. Sheepdog Initialization**
```javascript
// Add to global scope
const DOG = {
  x: 90, z: 90, vx: 0, vz: 0,
  nipT: -9, barkT: -9,
  model: null, mode: 'manual'
};

// Add to initScene()
function initSheepdog() {
  DOG.model = new THREE.Group();
  const body = new THREE.Mesh(
    new THREE.CapsuleGeometry(2, 8, 6, 12),
    new THREE.MeshStandardMaterial({ color: 0x6b7280, roughness: 0.8 })
  );
  body.rotation.x = Math.PI / 2;
  body.position.y = 4;
  DOG.model.add(body);
  
  const head = new THREE.Mesh(
    new THREE.SphereGeometry(1.8, 16, 14),
    new THREE.MeshStandardMaterial({ color: 0x9ca3af })
  );
  head.position.set(0, 6, -3.5);
  DOG.model.add(head);
  
  scene.add(DOG.model);
  DOG.model.position.set(90, 0, 90);
}
```

**2. Hamster Predation in `updateCat()`**
```javascript
// Add inside the updateCat loop:
if (!H.dead && !c.inPen) {
  const dHam = Math.hypot(p.x - H.x, p.z - H.z);
  if (dHam < 2.0 && c.E.fear < 0.3 && c.D.play > 0.5 && Math.random() < 0.01) {
    H.dead = true;
    H.eatenBy = c.id;
    H.respawnTimer = 5.0;
    c.B.hamsterIsPrey = 1.0;
    sfx.hamsterDie();
    toast(`💀 Cat ${c.id} ate the hamster!`, '#f87171');
  }
}
```

**3. Explicit Traits in `newCat()`**
```javascript
// Add to newCat():
const T = TEMPERAMENTS[i % TEMPERAMENTS.length];
const traitMap = TEMPERAMENT_TO_TRAITS[T.n];
c.traits = {
  cognitive: { ...traitMap.cog },
  affective: { ...traitMap.aff },
  conative: { ...traitMap.con }
};
```

**4. Trait Usage in `updateCat()`**
```javascript
// Example: Memory affects belief decay
B.hamFresh = Math.max(0, B.hamFresh - dt * 0.14 * (1 - c.traits.cognitive.memory * 0.5));

// Example: Socialness affects knowledge sharing
const shareRate = dt * 0.30 * c.traits.conative.socialness;

// Example: Energy affects speed
const maxV = (0.44 + c.traits.conative.energy * 0.2) * speedMul;
```

---

### 4.3 Testing Strategy

#### A. Unit Tests (Manual Verification)
| **Test** | **How to Test** | **Expected Result** |
|----------|-----------------|---------------------|
| Sheepdog Nip | Switch to dog, RMB near cat | Cat flees, fear increases |
| Hamster Death | Move cat into hamster | Hamster dies, respawns in 5s |
| Trait Effects | Inspect Cat 1 (skittish) vs. Cat 2 (bold) | Skittish cat has higher anxiety, lower trust |
| Knowledge Sharing | Pen 2 cats, watch telemetry | Both cats gain same `B.tom` value |
| Hunt Mode | Kill hamster, watch cats | Cats chase hamster on respawn |

#### B. Balance Tests
| **Scenario** | **Metric** | **Target** |
|-------------|------------|------------|
| Early Game (0–1 min) | % cats penned | >80% |
| Mid Game (1–3 min) | Hive Intel % | 30–60% |
| Late Game (3–5 min) | Time to pen all cats | <30s (with good play) |
| Sheepdog vs. Hamster | Win rate | ~50/50 |

---

### 4.4 Performance Considerations

| **Feature** | **Performance Impact** | **Mitigation** |
|-------------|------------------------|----------------|
| Knowledge Sharing VFX | High (many lines) | Limit to 5 lines at once, reuse geometries |
| Sheepdog AI | Medium (pathfinding) | Use simple steering, no pathfinding |
| Trait System | Low (just math) | None needed |
| Hamster Predation | Low (collision checks) | Use spatial partitioning if >20 cats |

**Optimization Tips**:
- **Object Pooling**: Reuse `THREE.Line` objects for knowledge-sharing VFX.
- **Distance Checks**: Use `Math.hypot` for 2D distance (faster than 3D).
- **Early Exits**: Skip updates for cats far from herder (e.g., `if (dHam > 100) continue`).

---

## 📊 PART 5: APPENDICES

### A. Parameter Tuning Guide

| **Parameter** | **Current Value** | **Recommended Range** | **Effect** |
|---------------|-------------------|----------------------|------------|
| `B.hamFresh` decay | 0.14 | 0.1–0.2 | How fast cats forget hamster position |
| `E.fear` decay | 0.30 | 0.2–0.4 | How fast cats calm down |
| `B.tom` growth | 0.10 | 0.05–0.15 | How fast cats learn ToM |
| `B.trap` growth | 0.055 | 0.03–0.08 | How fast cats learn pen = trap |
| Knowledge share rate | 0.30 | 0.2–0.5 | How fast cats share knowledge |
| Nip fear boost | 0.6 | 0.4–0.8 | How scary nips are |
| Bark fear boost | 0.3 | 0.2–0.5 | How scary barks are |

**Tuning Tips**:
- Start with **higher values** (cats learn fast, fear decays slow).
- If game is **too hard**, reduce learning rates or increase fear decay.
- If game is **too easy**, increase learning rates or add more cats.

---

### B. Future Extensions (Out of Scope for Now)

| **Feature** | **Description** | **Effort** | **Priority** |
|-------------|-----------------|------------|--------------|
| **Cat Breeds** | Different breeds with unique traits | Medium | Low |
| **Day/Night Cycle** | Cats more active at night | High | Low |
| **Multiplayer** | Co-op herding | Very High | Low |
| **Procedural Maps** | Random arenas | Medium | Low |
| **Cat Customization** | Player designs cats | Medium | Low |
| **Achievements** | Unlockable goals | Low | Low |

---

### C. References (Psychology & Game Design)

#### Psychology
1. Lazarus, R. S. (1991). *Emotion and Adaptation*. Oxford University Press. **Core appraisal theory.**
2. Mehrabian, A. (1996). *Pleasure-Arousal-Dominance: A General Framework for Describing Emotions*. Current Psychology. **PAD model.**
3. Premack, D., & Woodruff, G. (1978). Does the chimpanzee have a theory of mind? *Behavioral and Brain Sciences*. **Theory of Mind.**
4. Bandura, A. (1977). *Social Learning Theory*. Prentice Hall. **Observational learning.**
5. Crowell-Davis, S. L. (2007). *Cat Behavior: Social Organization, Communication and Development*. **Feline behavior.**
6. Coppinger, R., & Coppinger, L. (2001). *Dogs: A Startling New Understanding of Canine Origin, Behavior and Evolution*. **Herding behavior.**

#### Game Design
1. Reynolds, C. W. (1987). *Flocks, Herds, and Schools: A Distributed Behavioral Model*. **Emergent behavior.**
2. Hunicke, R., LeBlanc, M., & Zubek, R. (2004). *MDA: A Formal Approach to Game Design and Game Research*. **Game design framework.**
3. Juul, J. (2013). *Half-Real: Video Games between Real Rules and Fictional Worlds*. **Player agency.**

---

### D. Glossary

| **Term** | **Definition** | **Example in Game** |
|----------|----------------|---------------------|
| **CAC** | Cognitive-Affective-Conative model | The core agent architecture |
| **ToM** | Theory of Mind | `B.tom`: Cat believes hamster is herding it |
| **PAD** | Pleasure-Arousal-Dominance | Emotional state summary |
| **Utility Arbitration** | Goal selection by scoring | `U.FLEE` vs. `U.EXPLORE` |
| **Homeostatic Drive** | Self-correcting need | `D.rest` increases with fatigue |
| **Social Learning** | Learning from others | Cats share `B.gateOpen` |
| **Hive Intel** | Collective knowledge | Average of all cats' beliefs |

---

## ✅ Conclusion

This specification gives you **everything needed** to extend PROJECT OVINE into a **psychologically rich, emergent, and fun** cat herding sandbox. The key is to:

1. **Start with the process model** (your existing code already does this well).
2. **Add the 4 feedback loops** (Conative→Cognitive, Affective→Cognitive, etc.).
3. **Implement the high-priority features** (sheepdog, traits, predation).
4. **Polish with visual feedback** (knowledge sharing, trait appearances).

**Result**: A game that *feels alive* without requiring a PhD to play—or to code.

---

> **Next Steps**: Pick a feature from **Phase 1** (e.g., hamster predation) and implement it using the pseudocode above. Test, iterate, and move to the next feature. The modular design ensures each addition is **safe, isolated, and reversible**.