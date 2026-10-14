# React-Three-Fiber Quick Reference

Fast lookup for common patterns and APIs used in 3D React development.

## 🎯 Canvas & Scene Setup

```javascript
import { Canvas } from '@react-three/fiber';

<Canvas
  // Camera settings
  camera={{ 
    position: [0, 0, 5],  // [x, y, z]
    fov: 75,              // field of view
    near: 0.1,            // near clipping plane
    far: 1000             // far clipping plane
  }}
  
  // Renderer settings
  gl={{ 
    alpha: false,         // transparency
    antialias: true       // smooth edges
  }}
  
  // Performance
  dpr={[1, 2]}           // device pixel ratio
  frameloop="demand"     // render only on demand
  orthographic           // orthographic camera (no perspective)
  flat                   // no tone mapping
>
  {/* Scene content */}
</Canvas>
```

## 🎨 Basic 3D Elements

### Mesh (Most Common)
```javascript
<mesh position={[0, 0, 0]} rotation={[0, 0, 0]} scale={1}>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="red" />
</mesh>
```

### Geometry
```javascript
<boxGeometry args={[width, height, depth]} />
<sphereGeometry args={[radius, widthSegments, heightSegments]} />
<cylinderGeometry args={[radiusTop, radiusBottom, height, radialSegments]} />
<planeGeometry args={[width, height]} />
<torusGeometry args={[radius, tubeRadius, radialSegments, tubularSegments]} />
```

### Materials
```javascript
// Basic (no lights needed)
<meshBasicMaterial color="red" />

// Standard (PBR - physically based rendering)
<meshStandardMaterial 
  color="red"
  metalness={0.5}
  roughness={0.5}
/>

// PhongMaterial (shiny)
<meshPhongMaterial 
  color="red"
  shininess={100}
/>

// Lambert (matte)
<meshLambertMaterial color="red" />
```

## 💡 Lighting

```javascript
// Ambient: Overall brightness, no shadows
<ambientLight intensity={0.5} />

// Point: Light from specific position (like light bulb)
<pointLight position={[10, 10, 10]} intensity={1} distance={100} decay={2} />

// Directional: Light from far away (like sun)
<directionalLight position={[5, 5, 5]} intensity={1} />

// Spotlight: Cone of light
<spotLight position={[10, 10, 10]} angle={0.5} intensity={1} />

// Hemisphere: Light from above and below
<hemisphereLight skyColor="blue" groundColor="brown" intensity={1} />
```

## ⚙️ Hooks

### useFrame (Animation Loop)
```javascript
import { useFrame } from '@react-three/fiber';

useFrame(({ clock, scene, camera, gl }, delta) => {
  // Runs every frame (once per screen refresh)
  const elapsed = clock.elapsedTime;
  // delta = seconds since last frame (don't call clock.getDelta() yourself)

  meshRef.current.rotation.x += 1 * delta;  // 1 radian per second
});

// With render priority (any non-zero priority takes over rendering —
// you must call gl.render yourself)
useFrame((state, delta) => {...}, priority)
```

### useThree (Access Scene/Camera)
```javascript
import { useThree } from '@react-three/fiber';

const { 
  camera,          // Three.js camera
  scene,           // Three.js scene
  gl,              // WebGL renderer
  viewport,        // Current viewport info
  pointer,         // Pointer position, x and y from -1 to 1
  clock            // Clock object
} = useThree();
```

### useLoader (Load Assets)
```javascript
import { useLoader } from '@react-three/fiber';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const gltf = useLoader(GLTFLoader, '/model.glb');
```

### useGLTF (Preferred GLTF Loading)
```javascript
import { useGLTF } from '@react-three/drei';

const { scene, nodes, materials } = useGLTF('/model.glb');

// Preload for faster loading
useGLTF.preload('/model.glb');
```

### useProgress (Loading Progress)
```javascript
import { useProgress } from '@react-three/drei';

const { active, progress, errors, item, loaded, total } = useProgress();

return <>{Math.round(progress)}%</>;
```

## 📍 Positioning & Transform

```javascript
// Position [x, y, z]
<mesh position={[0, 0, 0]} />
<mesh position-x={5} />  // Shorthand for individual axis

// Rotation [x, y, z] in radians
<mesh rotation={[Math.PI / 2, 0, 0]} />
<mesh rotation-y={Math.PI} />

// Scale [x, y, z] or uniform
<mesh scale={1.5} />
<mesh scale={[1, 2, 1]} />
<mesh scale-x={2} />

// Groups (Transform together)
<group position={[5, 0, 0]} rotation={[0, Math.PI, 0]}>
  <mesh />
  <mesh />
</group>
```

## 🎬 Common Animation Patterns

### Continuous Rotation
```javascript
useFrame((state, delta) => {
  mesh.current.rotation.y += 0.6 * delta;  // radians per second
});
```

### Sine Wave Motion (Bobbing)
```javascript
useFrame(({ clock }) => {
  const t = clock.elapsedTime;
  mesh.current.position.y = Math.sin(t) * 2;  // Oscillates -2 to +2
});
```

### Smooth Tweening (Lerp)
```javascript
useFrame(() => {
  const friction = 0.1;  // 0 = no movement, 1 = instant
  mesh.current.position.x = THREE.MathUtils.lerp(
    mesh.current.position.x,
    targetX,
    friction
  );
});
```

### Mouse Tracking
```javascript
useFrame(({ pointer }) => {
  // pointer.x and pointer.y are -1 to 1
  mesh.current.rotation.x = pointer.y * Math.PI;
  mesh.current.rotation.y = pointer.x * Math.PI;
});
```

### Scroll Animation
```javascript
useEffect(() => {
  const handleScroll = () => {
    const scrollPercent = window.scrollY / (document.body.scrollHeight - window.innerHeight);
    mesh.current.rotation.y = scrollPercent * Math.PI * 2;
  };
  
  window.addEventListener('scroll', handleScroll);
  return () => window.removeEventListener('scroll', handleScroll);
}, []);
```

## 🧩 Drei Helpers

### OrbitControls (Rotate camera with mouse)
```javascript
import { OrbitControls } from '@react-three/drei';

<Canvas>
  <OrbitControls />
  {/* Scene */}
</Canvas>
```

### PerspectiveCamera (Explicit camera)
```javascript
import { PerspectiveCamera } from '@react-three/drei';

<PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
```

### Environment (HDRI Lighting)
```javascript
import { Environment } from '@react-three/drei';

<Environment preset="sunset" />  // preset | path
```

### useHelper (Debug helpers)
```javascript
import { useHelper } from '@react-three/drei';

const lightRef = useRef();
useHelper(lightRef, THREE.SpotLightHelper, 'cyan');

<spotLight ref={lightRef} />
```

## 🔧 Math Utilities (THREE.MathUtils)

```javascript
// Random numbers
THREE.MathUtils.randFloat(min, max);
THREE.MathUtils.randFloatSpread(range);  // -range/2 to +range/2

// Lerp (Linear Interpolation)
THREE.MathUtils.lerp(start, end, t);  // t = 0 to 1

// Clamp
THREE.MathUtils.clamp(value, min, max);

// Euler angles
const euler = new THREE.Euler(x, y, z);

// Vector operations
const v1 = new THREE.Vector3(1, 2, 3);
const v2 = new THREE.Vector3(4, 5, 6);
v1.add(v2);
v1.distance(v2);
```

## 📦 Common Imports

```javascript
// Core
import { Canvas, useFrame, useThree } from '@react-three/fiber';

// Helpers
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';

// Physics
import { Physics, RigidBody } from '@react-three/rapier';

// Post Processing
import { EffectComposer, Bloom, DepthOfField } from '@react-three/postprocessing';

// Three.js Core
import * as THREE from 'three';

// Materials
import { shaderMaterial } from '@react-three/drei';
```

## ⚡ Performance Tips

```javascript
// 1. Render on demand (not every frame)
<Canvas frameloop="demand">

// 2. Clamp pixel ratio (min, max)
<Canvas dpr={[1, 2]}>

// 3. Use Suspense for async loading
<Suspense fallback={<Fallback />}>
  <Model />
</Suspense>

// 4. Preload assets
useGLTF.preload('/model.glb');

// 5. Use instancing for many objects
<instancedMesh args={[geometry, material, count]} />

// 6. Pause when off-screen: frameloop="never" while hidden
<Canvas frameloop={visible ? "always" : "never"}>  // visible from an IntersectionObserver

// 7. Avoid creating objects in render
const geom = useMemo(() => new THREE.BoxGeometry(), []);
```

## 🐛 Debugging

```javascript
// Log scene tree
const { scene } = useThree();
console.log(scene);

// Add stats monitor
import { Stats } from '@react-three/drei';
<Canvas><Stats /></Canvas>

// Debug helper (Show object bounds)
import { useHelper } from '@react-three/drei';
const meshRef = useRef();
useHelper(meshRef, THREE.BoxHelper, 'yellow');

// Check FPS: use <Stats /> above, or the browser DevTools Performance tab
```

## 🎬 Event Handlers

```javascript
<mesh
  onClick={(e) => console.log('clicked')}
  onPointerOver={(e) => console.log('hover')}
  onPointerOut={(e) => console.log('leave')}
  onPointerMove={(e) => console.log('move')}
>
  <boxGeometry />
  <meshBasicMaterial />
</mesh>
```

## 📏 Responsive Canvas

```javascript
function ResponsiveScene() {
  const { camera, size } = useThree();
  
  useEffect(() => {
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix();
  }, [size, camera]);
  
  return null;
}
```

---

**Pro Tips:**
- Always use `useRef` for frequently updated values
- Use `Suspense` for async asset loading
- Memoize expensive computations with `useMemo`
- Profile with DevTools before optimizing
- Test on actual devices, not just desktop browsers
