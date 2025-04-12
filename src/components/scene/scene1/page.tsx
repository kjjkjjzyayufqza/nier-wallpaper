import { RigidBody } from '@react-three/rapier'

export default function Scene1() {
  return (
    <>
      <RigidBody colliders="cuboid" type="fixed" position={[0, -1, 0]}>
        <mesh castShadow>
          <boxGeometry args={[20, 1, 20]} />
          <meshStandardMaterial color="#5b5b5b" />
        </mesh>
      </RigidBody>
      <gridHelper args={[10, 10]} />
    </>
  )
}
