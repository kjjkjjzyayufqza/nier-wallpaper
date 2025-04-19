import React from 'react';
import { RigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';

/** 
 * Side configuration for air walls
 * Each property represents one side of the box
 * true = create wall, false = no wall
 */
export interface AirWallSides {
  /** North side (positive Z) */
  north?: boolean;
  /** South side (negative Z) */
  south?: boolean;
  /** East side (positive X) */
  east?: boolean;
  /** West side (negative X) */
  west?: boolean;
}

/**
 * Properties for the AirWalls component
 */
interface AirWallsProps {
  /** Position of the base mesh [x, y, z] */
  position: [number, number, number];
  /** Dimensions of the base mesh [width, height, depth] */
  dimensions: [number, number, number];
  /** Optional height of the air walls (default: 5) */
  wallHeight?: number;
  /** Optional thickness of the air walls (default: 0.2) */
  wallThickness?: number;
  /** Optional visibility of the air walls for debugging (default: false) */
  visible?: boolean;
  /** Optional color of the air walls when visible (default: "red") */
  wallColor?: string;
  /** Optional configuration for which sides should have air walls (default: all sides) */
  sides?: AirWallSides;
}

/**
 * AirWalls component generates invisible barriers around the top perimeter of a mesh
 * to prevent the player from falling off edges.
 */
export const AirWalls: React.FC<AirWallsProps> = ({
  position,
  dimensions,
  wallHeight = 5,
  wallThickness = 0.2,
  visible = false,
  wallColor = "red",
  sides = { north: true, south: true, east: true, west: true }
}) => {
  const [x, y, z] = position;
  const [width, height, depth] = dimensions;
  
  // Calculate the y position of the top surface
  const topY = y + height / 2;
  
  // Calculate positions for the four walls
  const wallConfigs = [
    // North wall (z+)
    sides.north !== false && {
      position: new Vector3(x, topY + wallHeight / 2, z + depth / 2),
      args: [width + wallThickness, wallHeight, wallThickness] as [number, number, number]
    },
    // South wall (z-)
    sides.south !== false && {
      position: new Vector3(x, topY + wallHeight / 2, z - depth / 2),
      args: [width + wallThickness, wallHeight, wallThickness] as [number, number, number]
    },
    // East wall (x+)
    sides.east !== false && {
      position: new Vector3(x + width / 2, topY + wallHeight / 2, z),
      args: [wallThickness, wallHeight, depth + wallThickness] as [number, number, number]
    },
    // West wall (x-)
    sides.west !== false && {
      position: new Vector3(x - width / 2, topY + wallHeight / 2, z),
      args: [wallThickness, wallHeight, depth + wallThickness] as [number, number, number]
    }
  ];
  
  // Filter out false values (sides that shouldn't have walls)
  const walls = wallConfigs.filter(Boolean);

  return (
    <>
      {walls.map((wall: any, index) => (
        <RigidBody 
          key={`air-wall-${index}`} 
          type="fixed" 
          colliders="cuboid"
          position={[wall.position.x, wall.position.y, wall.position.z]}
        >
          <mesh>
            <boxGeometry args={wall.args} />
            <meshStandardMaterial 
              color={wallColor} 
              transparent={!visible} 
              opacity={visible ? 0.5 : 0} 
            />
          </mesh>
        </RigidBody>
      ))}
    </>
  );
};
