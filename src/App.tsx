import { Canvas } from '@react-three/fiber'
import { KeyboardControls, OrbitControls, useGLTF } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { useEffect, useState } from 'react'
import './App.css'
import { base64GLB } from './player.glb';
import { Perf } from 'r3f-perf'
import { Player } from './components/player/page'
import { default as Scene1 } from './components/scene/scene1/page'

const keyboardMap = [
  { name: "forward", keys: ["KeyW"] },
  { name: "backward", keys: ["KeyS"] },
  { name: "left", keys: ["KeyA"] },
  { name: "right", keys: ["KeyD"] },
  { name: "escape", keys: ["Escape"] },
]

function App() {

  return (
    <div style={{ width: '100%', height: '100vh' }}>
      <KeyboardControls map={keyboardMap}>
        <Canvas camera={{ position: [5, 5, Math.PI * -4], fov: 45 }}>
          {/* <OrbitControls /> */}
          <Perf />
          <ambientLight intensity={10} />
          <pointLight position={[10, 10, 10]} />
          <Physics debug timeStep={"vary"}>
            {/* Scene 1 Content */}
            <Scene1 />

            {/* Model with physics */}
            <Player />
          </Physics>
        </Canvas>
      </KeyboardControls>
    </div>
  )
}

export default App
