import { Canvas } from '@react-three/fiber'
import { KeyboardControls, OrbitControls, useGLTF } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import { useEffect, useState } from 'react'
import './App.css'
import { base64GLB } from './player.glb';
import { Perf } from 'r3f-perf'
import { Player } from './components/player/Player'

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
        <Canvas camera={{ position: [0, 5, 10], fov: 45 }}>
          <Perf />
          <ambientLight intensity={10} />
          <pointLight position={[10, 10, 10]} />
          <Physics debug timeStep={"vary"}>
            {/* Ground */}
            <RigidBody type="fixed" position={[0, -2, 0]}>
              <mesh receiveShadow>
                <boxGeometry args={[20, 1, 20]} />
                <meshStandardMaterial color="#5b5b5b" />
              </mesh>
            </RigidBody>

            {/* Falling boxes */}
            <RigidBody position={[0, 5, 0]}>
              <mesh castShadow>
                <boxGeometry />
                <meshStandardMaterial color="orange" />
              </mesh>
            </RigidBody>

            <RigidBody position={[1, 7, 0]}>
              <mesh castShadow>
                <boxGeometry />
                <meshStandardMaterial color="hotpink" />
              </mesh>
            </RigidBody>

            {/* Model with physics */}
            <Player />
          </Physics>
          <OrbitControls />
        </Canvas>
      </KeyboardControls>
    </div>
  )
}

export default App
