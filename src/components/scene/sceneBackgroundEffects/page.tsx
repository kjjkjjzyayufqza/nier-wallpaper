import { RigidBody } from '@react-three/rapier'
import { useRef, useState, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

export default function SceneBackgroundEffects() {
  const CONFIG = {
    count: 20,
    size: 1,
    color: "#EAE5D1",
    speed: 0.005,
    x: {
      min: -100,
      max: 100,
    },
    y: {
      min: -50,
      max: -100,
    },
    z: {
      min: -100,
      max: 100,
    },
  }
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const [cubes, setCubes] = useState<Array<{
    position: THREE.Vector3
    direction: THREE.Vector3
  }>>([])

  // Initialize cube positions and directions
  useEffect(() => {
    const initialCubes = []
    for (let i = 0; i < CONFIG.count; i++) {
      initialCubes.push({
        position: new THREE.Vector3(
          Math.random() * (CONFIG.x.max - CONFIG.x.min) + CONFIG.x.min,
          Math.random() * (CONFIG.y.max - CONFIG.y.min) + CONFIG.y.min,
          Math.random() * (CONFIG.z.max - CONFIG.z.min) + CONFIG.z.min
        ),
        direction: new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        ).normalize().multiplyScalar(CONFIG.speed) // Very slow movement
      })
    }
    setCubes(initialCubes)
  }, [])

  // Update cube positions on each frame
  useFrame(() => {
    if (!meshRef.current || cubes.length === 0) return

    const tempMatrix = new THREE.Matrix4()
    
    cubes.forEach((cube, i) => {
      // Update position based on direction
      cube.position.add(cube.direction)
      
      // Optional: Contain cubes within boundaries
      if (cube.position.x < CONFIG.x.min || cube.position.x > CONFIG.x.max) cube.direction.x *= -1
      if (cube.position.y < CONFIG.y.min || cube.position.y > CONFIG.y.max) cube.direction.y *= -1
      if (cube.position.z < CONFIG.z.min || cube.position.z > CONFIG.z.max) cube.direction.z *= -1
      
      // Set matrix for this instance
      tempMatrix.makeTranslation(
        cube.position.x,
        cube.position.y,
        cube.position.z
      )
      
      meshRef.current.setMatrixAt(i, tempMatrix)
    })
    
    meshRef.current.instanceMatrix.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={meshRef} args={[undefined, undefined, CONFIG.count]}>
        <boxGeometry args={[CONFIG.size, CONFIG.size, CONFIG.size]} />
        <meshStandardMaterial color={CONFIG.color} />
      </instancedMesh>
    </>
  )
}
