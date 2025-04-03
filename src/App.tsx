import { Canvas, useLoader } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import './App.css'
import { base64GLB } from './player.glb';

function Model() {

  const [loading, setLoading] = useState(true);
  const loader = new GLTFLoader();
  const modelRef = useRef(null);

  useEffect(() => {
    loader.load(
      base64GLB,
      (gltf) => {
        modelRef.current = gltf.scene;
        console.log('Model loaded successfully:', gltf);
        setLoading(false);
      },
      undefined,
      (error) => {
        console.error('Error loading model:', error);
      }
    );
  }, [base64GLB, loader]);

  if(loading) {
    return null; // or a loading spinner
  }

  return (
    <primitive
      object={modelRef.current}
      scale={[10, 10, 10]}
      position={[0, 0, 0]}
    />
  )
}

function App() {

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 45 }}>
        <ambientLight intensity={10} />
        <pointLight position={[10, 10, 10]} />
        <Model />
        <OrbitControls />
      </Canvas>
    </div>
  )
}

export default App
