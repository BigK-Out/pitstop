# Floating Bananas - React Three Fiber 3D Landing Page

A modern 3D landing page built with React, Three.js, and React-Three-Fiber, featuring floating 3D models with depth-of-field effects.

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

The dev server will open at `http://localhost:5173`

## 📁 Project Structure

```
.
├── index.html           # HTML entry point
├── vite.config.js       # Vite configuration
├── package.json         # Dependencies
├── src/
│   ├── main.jsx         # React entry point
│   ├── App.jsx          # Main component with Canvas setup
│   ├── Banana.jsx       # Individual banana component with animation
│   ├── App.css          # Component styles
│   └── index.css        # Global styles
└── public/
    └── banana.glb       # 3D model (add your optimized model here)
```

Until `public/banana.glb` exists, each banana renders as a yellow capsule placeholder
(the console will show "Could not load /banana.glb" errors — expected).

## 🎨 Key Features

### 1. **Component-Based 3D**
- Declarative React components for 3D objects
- Reusable Banana component mounted multiple times
- Clean separation of concerns

### 2. **Animation System**
- `useFrame` hook for 60fps animations
- Smooth upward motion with wrap-around
- Individual rotation on x, y, z axes
- Frame-rate independent spin (speeds are in radians per second)

### 3. **Depth Effects**
- Depth of Field (DoF) post-processing
- Focus target positioned at the middle of the banana field
- Variable focal length for blur intensity
- Bokeh scaling for visual polish

### 4. **Performance Optimization**
- Vite for fast builds
- Suspense boundary for async model loading
- Viewport-aware positioning
- Optimized glTF/GLB models with Draco compression

## 🛠️ Configuration

### Canvas Setup (App.jsx)
```javascript
<Canvas
  camera={{ position: [0, 0, 20], fov: 30, near: 0.1, far: 110 }}
  gl={{ alpha: false }}
>
```

### Key Parameters to Tweak

| Parameter | File | Effect |
|-----------|------|--------|
| `count` | src/App.jsx | Number of floating objects |
| `depth` | src/App.jsx | Distance range for objects (z-axis) |
| `fov` | src/App.jsx | Camera field of view (zoom level) |
| `target` | src/App.jsx | World point the depth-of-field effect focuses on |
| `bokehScale` | src/App.jsx | Intensity of blur effect |
| Rotation speeds | src/Banana.jsx (radians/second) | How fast objects spin |
| Motion speed | src/Banana.jsx (clock.elapsedTime × multiplier) | Vertical floating speed |

## 📦 Model Setup

### Using Your Own 3D Model

1. **Find/Create Model**
   - Download from Sketchfab.com (select downloadable, glTF format)
   - Ensure it's production-ready

2. **Optimize in Blender**
   ```
   - Open in Blender
   - Merge meshes: Select → Menu: Mesh → Join
   - Decimate modifier: Reduce poly count by 50-80%
   - Set origin to center: Object → Set Origin → Origin to Center of Mass
   - Export as GLB (File → Export → glTF)
   ```

3. **Further Compression**
   - Use gltf.report or gltfpack
   - Target: <300KB for web
   - Apply Draco compression

4. **Place Model**
   ```bash
   # Copy to public folder
   cp your-model.glb public/banana.glb
   ```

5. **Convert to React Component (Optional)**
   ```bash
   npx gltf-jsx public/banana.glb
   ```
   This creates a declarative React component for easier manipulation.
   Not required: `Banana.jsx` uses the first mesh it finds in the model, whatever it is named.

## 🎯 Animation Concepts

### useFrame Hook
```javascript
useFrame(({ clock }) => {
  const t = clock.elapsedTime; // Continuously increasing value
  ref.current.position.y = startY + Math.sin(t) * amplitude;
});
```

### Smooth Tweening with lerp
```javascript
// Smooth movement from A to B
ref.current.position.y = THREE.MathUtils.lerp(
  current,
  target,
  friction // 0.1 for slow damping, higher = faster
);
```

### Randomization
```javascript
// Random value between -range and +range
THREE.MathUtils.randFloatSpread(range)

// Random rotation (0 to 2π)
Math.random() * Math.PI * 2
```

## 📊 Performance Tips

1. **Reduce Draw Calls**
   - Batch objects with InstancedMesh
   - Use LOD (Level of Detail) for distant objects

2. **Optimize Textures**
   - Use KTX2 or Basis compression
   - Resize large textures for mobile

3. **Lazy Load Assets**
   - Use Suspense boundary
   - Load models only when needed

4. **Render Optimization**
   - Pause rendering when off-screen (IntersectionObserver)
   - Render on demand instead of every frame

## 🐛 Troubleshooting

### Model not showing
- Verify path in useGLTF: `/banana.glb` (starts with `/`)
- Check public folder structure
- Ensure Suspense boundary wraps Scene

### DoF effect not working
- Set `gl={{ alpha: false }}` on Canvas
- Check clipping planes: `near: 0.1, far: 110` (far must reach the farthest banana)
- `target` is a world position; keep it inside the banana field

### Performance issues
- Reduce `count` value
- Lower `bokehScale` or remove post-processing
- Check model file size and complexity

## 🔗 Resources

- [Three.js Docs](https://threejs.org/docs/)
- [React-Three-Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [Drei (R3F Helpers)](https://github.com/pmndrs/drei)
- [Blender Learning](https://www.blender.org/support/tutorials/)
- [Sketchfab 3D Models](https://sketchfab.com/)

## 📝 Notes from Tutorial

- Everything in Canvas is **loop-based** (60fps), not event-based
- All objects are centered by default in 3D space
- Position uses `[x, y, z]` where x=horizontal, y=vertical, z=depth
- Sine functions oscillate between -1 and 1 (perfect for bobbing)
- Multiply by `elapsed time` to control animation speed
- Multiply per-frame increments by `delta` so speed doesn't depend on screen refresh rate
- `Suspense` boundary required for async asset loading
- Model optimization is critical: aim for <300KB per model

Enjoy your fancy 3D landing page! 🚀
