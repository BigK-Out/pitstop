# Complete Setup Guide - Floating Bananas 3D Landing Page

## 📋 Files Included

### Core Application Files
1. **src/App.jsx** - Main Canvas component with scene setup
2. **src/Banana.jsx** - Individual banana component
3. **src/main.jsx** - React entry point
4. **index.html** - HTML shell
5. **vite.config.js** - Vite build configuration

### Styling
6. **src/App.css** - Component-specific styles
7. **src/index.css** - Global styles

### Configuration
8. **package.json** - Dependencies and scripts

### Documentation
9. **README.md** - Feature overview and tweaking guide
10. **SETUP_GUIDE.md** - This file
11. **R3F-CHEATSHEET.md** - React-Three-Fiber quick reference

---

## 🚀 Step-by-Step Setup

### Step 1: Project Layout
This folder is already a complete Vite project:
```
.
├── src/
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   ├── index.css
│   └── Banana.jsx
├── index.html
├── vite.config.js
├── package.json
└── public/
    └── banana.glb       (add your model here)
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Add 3D Model
Download or prepare a banana model (or any 3D object):
- Download from Sketchfab (glTF format)
- Optimize in Blender (see README.md)
- Save as `banana.glb` in the `public/` folder
- Mesh/material names don't matter — the first mesh in the file is used
- Without a model you'll see yellow capsule placeholders instead

### Step 4: Run Development Server
```bash
npm run dev
```

Browser should open automatically at `http://localhost:5173`

---

## 🎯 Quick Reference

### Key Components

**src/App.jsx - Canvas Setup**
```javascript
const count = 100;           // Number of floating objects
const depth = 80;            // Z-axis distribution range
const NEAR_Z = 10;           // Z of the closest banana (camera is at z = 20)
// fov: 30 in the Canvas camera prop = field of view (zoom)

// Depth of Field Settings
target={[0, 0, NEAR_Z - depth / 2]}  // World point that's sharp (middle of the field)
focalLength={0.5}                    // Width of focus zone
bokehScale={11}                      // Blur intensity
```

**src/Banana.jsx - Animation Controls**
```javascript
const t = clock.elapsedTime * 0.8;  // Speed multiplier (0.8 = slower)

// Rotation speeds, random per banana, in radians per second
rotationSpeedX: (Math.random() - 0.5) * 1.2,

// Applied each frame, scaled by delta so it's frame-rate independent
ref.current.rotation.x += data.rotationSpeedX * delta;
```

---

## 🎨 Customization Examples

### Increase Floating Speed
```javascript
// In src/Banana.jsx, line with motion:
const t = clock.elapsedTime * 1.5;  // Was 0.8, now 1.5 (faster)
```

### Make Objects Larger
```javascript
// In src/Banana.jsx, in useState:
s: Math.random() * 0.8 + 0.5,  // Was 0.5 + 0.25, now 0.8 + 0.5
```

### Change Background Color
```javascript
// In src/App.jsx:
<color attach="background" args={["#FF6B6B"]} />  // New color
```

### Adjust Rotation
```javascript
// In Banana.jsx, in useState — bigger multiplier = faster spin:
rotationSpeedX: (Math.random() - 0.5) * 3,  // Was * 1.2
```

### More Post-Processing Effects
```javascript
// In src/App.jsx, add to EffectComposer:
import { Bloom, ChromaticAberration } from "@react-three/postprocessing";

<EffectComposer>
  <DepthOfField {...props} />
  <Bloom intensity={1} />
  <ChromaticAberration offset={[0.01, 0.01]} />
</EffectComposer>
```

---

## 🔧 Troubleshooting

### Model Not Loading?
```javascript
// Check that path starts with /
const MODEL_URL = "/banana.glb";  // in src/Banana.jsx

// Ensure file exists in public/ folder:
// public/banana.glb ✓
// public/models/banana.glb ✗ (would need path="/models/banana.glb")
```

### Blur Effect Not Visible?
```javascript
// Required: alpha must be false
<Canvas gl={{ alpha: false }}>

// And set camera clipping planes correctly
camera={{ near: 0.1, far: 110 }}
// far value should be > your depth value (80)
```

### Objects Disappearing?
```javascript
// Bananas wrap from +h back to -h, where h is just past the visible edge.
// If they pop in or out at the edges, lower the divisor (e.g. / 1.2) so they wrap further off-screen:
const h = vp.height / 1.5;
ref.current.position.y = THREE.MathUtils.euclideanModulo(data.y + t + h, 2 * h) - h;
```

---

## 📊 Performance Monitoring

### Check FPS in Browser
```javascript
// In src/App.jsx (drei is already installed):
import { Stats } from '@react-three/drei';

// Then inside <Canvas>:
<Stats />
```

### Reduce Lag
1. Lower `count` from 100 to 50
2. Remove post-processing effects temporarily
3. Lower `bokehScale` or remove DoF effect
4. Reduce model complexity/polycount

---

## 🎓 Learning Path

### Understand the Code in This Order:
1. **src/main.jsx** - Entry point
2. **src/App.jsx** - Canvas & scene setup
3. **src/Banana.jsx** - Single object animation
4. **src/App.css** - Styling

### Concepts to Master:
1. **useFrame hook** - Runs every frame (60fps)
2. **useRef** - Direct object access for mutations
3. **useState** - Store initial random values
4. **useThree** - Access camera, viewport, scene
5. **Suspense** - Wait for async model loading
6. **Error boundaries** - Fall back to a placeholder when the model fails to load

---

## 🚀 Next Steps

### Add Interactivity
```javascript
// Mouse tracking (pointer.x / pointer.y range from -1 to 1)
useFrame(({ pointer }) => {
  ref.current.rotation.x = pointer.y * 0.5;
  ref.current.rotation.y = pointer.x * 0.5;
});
```

### Add Scroll Animation
```javascript
// Use gsap with ScrollTrigger (npm install gsap)
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

useEffect(() => {
  gsap.to(ref.current.position, {
    z: 50,
    scrollTrigger: {
      trigger: containerRef.current,
      start: "top center",
      end: "bottom center",
      scrub: 1,
    }
  });
}, []);
```

### Deploy to Vercel
```bash
npm run build
# Push to GitHub
# Connect to Vercel for automatic deployment
```

---

## 📚 Additional Resources

- **React-Three-Fiber Docs**: https://docs.pmnd.rs/react-three-fiber/
- **Three.js Fundamentals**: https://threejs.org/
- **Drei Helpers**: https://github.com/pmndrs/drei
- **Post-Processing**: https://www.npmjs.com/package/@react-three/postprocessing
- **GLTF Tools**: https://khronos.org/gltf/

---

## ✅ Checklist Before Launch

- [ ] Model is optimized (<300KB)
- [ ] All file paths are correct
- [ ] npm dependencies installed
- [ ] Development server runs without errors
- [ ] Floating objects appear on screen
- [ ] Depth-of-field effect visible
- [ ] Mobile responsive (use DevTools)
- [ ] Performance acceptable (60fps or close)
- [ ] All three.js warnings resolved in console

Happy coding! 🎉
