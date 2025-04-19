import { RigidBody } from '@react-three/rapier'
import { AirWalls } from '../../custom/AirWalls'
import { AutoAirWalls } from '../../custom/AutoAirWalls'
import { AirWallsWrapper } from '../../custom/AirWallsWrapper'

interface Scene1Props {
  showAirWalls?: boolean;
}

export default function Scene1({ showAirWalls = false }: Scene1Props) {

  return (
    <>
      <gridHelper args={[10, 10]} />
      <RigidBody colliders="cuboid" type="fixed">
        <AutoAirWalls visible={showAirWalls} wallHeight={3} sides={{ north: false }}>
          <mesh position={[0, -25, 0]}>
            <boxGeometry args={[20, 50, 20]} />
            <meshStandardMaterial color="#CBC6AF" />
          </mesh>
        </AutoAirWalls>
      </RigidBody>
      <RigidBody colliders="cuboid" type="fixed" position={[0, 0, 20]}>
        <AutoAirWalls visible={showAirWalls} wallHeight={3} sides={{ south: false }}>
          <mesh position={[0, -25, 0]}>
            <boxGeometry args={[20, 50, 20]} />
            <meshStandardMaterial color="#CBC6AF" />
          </mesh>
        </AutoAirWalls>
      </RigidBody>
    </>
  )
}
