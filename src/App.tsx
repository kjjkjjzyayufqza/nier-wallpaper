import { Canvas } from '@react-three/fiber'
import { KeyboardControls, OrbitControls, useGLTF } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import './App.css'
import { Perf } from 'r3f-perf'
import { Player } from './components/player/page'
import { default as Scene1 } from './components/scene/scene1/page'
import { Bloom, DepthOfField, EffectComposer, Grid, Noise, SMAA, Vignette } from '@react-three/postprocessing'
import SceneBackgroundEffects from './components/scene/sceneBackgroundEffects/page'
import { NoToneMapping } from 'three'
import { useState, useEffect } from 'react'
import Scene2 from './components/scene/scene2/page'

const keyboardMap = [
  { name: "forward", keys: ["KeyW"] },
  { name: "backward", keys: ["KeyS"] },
  { name: "left", keys: ["KeyA"] },
  { name: "right", keys: ["KeyD"] },
  { name: "escape", keys: ["Escape"] },
  { name: "toggleAirWalls", keys: ["KeyV"] }, // Press V to toggle air walls visibility
]

function App() {
  // State to control air walls visibility
  const [showAirWalls, setShowAirWalls] = useState(false);

  // Handle keyboard events for air walls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'KeyV') {
        setShowAirWalls(prev => !prev);
        console.log("Air walls visibility:", !showAirWalls);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAirWalls]);

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas
          camera={{ position: [15, 15, Math.PI * -4], fov: 45, near: 0.1, far: 10000 }}
          gl={{
            toneMapping: NoToneMapping,
            powerPreference: "high-performance",
          }}>
          <color attach="background" args={["#37342E"]} />
          <EffectComposer>
            <SMAA />
            <Bloom
              intensity={0.1} // The bloom intensity.
              blurPass={undefined} // A blur pass.
              luminanceThreshold={0.9} // luminance threshold. Raise this value to mask out darker elements in the scene.
              luminanceSmoothing={0.025} // smoothness of the luminance threshold. Range is [0, 1]
              mipmapBlur={false} // Enables or disables mipmap blur.
            />
            <Noise opacity={0.005} />
          </EffectComposer>
          <OrbitControls />
          <Perf />
          <ambientLight intensity={4.1} />
          <SceneBackgroundEffects />
          <Physics debug timeStep={"vary"}>
            {/* Scene 1 Content - Pass showAirWalls prop */}
            <Scene2 showAirWalls={showAirWalls} />

            {/* Model with physics */}
            <Player />
          </Physics>
        </Canvas>
      </KeyboardControls>
    </div>
  )
}

export default App
