import { RigidBody } from '@react-three/rapier'
import { IrregularAirWalls } from '../../custom/IrregularAirWalls'

interface Scene2Props {
  showAirWalls?: boolean;
}

export default function Scene2({ showAirWalls = false }: Scene2Props) {
  // Define two models: a square (model A) and a narrow rectangle (model B) connected to it
  
  // Model A is a square at position [0, 0, 0]
  // Model B is a narrow rectangle positioned at [0, 0, 15] (connected to the north side of A)
  
  // Define the models configuration
  const models = [
    { id: 'modelA', topY: 0 },  // Square base at y=0
    { id: 'modelB', topY: 0 },  // Rectangle base at y=0
  ];
  
  // Define the boundary points with perfect connections between models
  const borders = [
    // Model A perimeter (except for the north side which connects to Model B)
    {
      points: [
        // West side of model A (front-left corner to back-left corner)
        { modelId: 'modelA', point: [-10, -10] as [number, number] },
        { modelId: 'modelA', point: [-10, 10] as [number, number] },
        
        // Connection point between Model A and Model B (left side)
        { modelId: 'modelA', point: [-5, 10] as [number, number] },
        { modelId: 'modelB', point: [-5, 10] as [number, number] },
        
        // Front side of Model B
        { modelId: 'modelB', point: [-5, 20] as [number, number] },
        { modelId: 'modelB', point: [5, 20] as [number, number] },
        
        // Connection point between Model B and Model A (right side)
        { modelId: 'modelB', point: [5, 10] as [number, number] },
        { modelId: 'modelA', point: [10, 10] as [number, number] },
        
        // East side of model A (back-right corner to front-right corner)
        { modelId: 'modelA', point: [10, 10] as [number, number] },
        { modelId: 'modelA', point: [10, -10] as [number, number] },
        
        // South side of model A (closing the loop)
        { modelId: 'modelA', point: [-10, -10] as [number, number] },
      ]
    }
  ];
  
  return (
    <>
      <IrregularAirWalls
        models={models}
        borders={borders}
        wallHeight={3}
        visible={showAirWalls}
        wallColor="red"
      >
        {/* Model A: Square base */}
        <RigidBody colliders="cuboid" type="fixed">
          <mesh position={[0, -5, 0]}>
            <boxGeometry args={[20, 10, 20]} />
            <meshStandardMaterial color="#CBC6AF" />
          </mesh>
        </RigidBody>
        
        {/* Model B: Narrow rectangular extension */}
        <RigidBody colliders="cuboid" type="fixed">
          <mesh position={[0, -5, 15]}>
            <boxGeometry args={[10, 10, 10]} />
            <meshStandardMaterial color="#ADB5BD" />
          </mesh>
        </RigidBody>
      </IrregularAirWalls>
    </>
  )
} 