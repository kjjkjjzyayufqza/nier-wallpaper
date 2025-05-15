import React, { ReactNode } from 'react';
import { RigidBody } from '@react-three/rapier';
import { Vector3 } from 'three';

interface ConnectedSegment {
  /** Start point of the wall segment (x,z coordinates) */
  start: [number, number];
  /** End point of the wall segment (x,z coordinates) */
  end: [number, number];
  /** Override height for this specific segment (optional) */
  height?: number;
}

interface ConnectedAirWallsProps {
  /** Children to render alongside the walls */
  children: ReactNode;
  /** Base Y position to place the walls (usually the top surface of the model) */
  baseY: number;
  /** Height of the walls */
  wallHeight?: number;
  /** Thickness of the walls */
  wallThickness?: number;
  /** Whether to make the walls visible (for debugging) */
  visible?: boolean;
  /** Color of the walls when visible */
  wallColor?: string;
  /** Array of wall segments defining the perimeter */
  segments: ConnectedSegment[];
}

/**
 * ConnectedAirWalls generates custom air walls along a defined perimeter,
 * allowing for irregular shapes and perfect connections between different models.
 */
export const ConnectedAirWalls: React.FC<ConnectedAirWallsProps> = ({
  children,
  baseY,
  wallHeight = 5,
  wallThickness = 0.2,
  visible = false,
  wallColor = "red",
  segments
}) => {
  // Generate walls for each segment
  const walls = segments.map((segment, index) => {
    const [x1, z1] = segment.start;
    const [x2, z2] = segment.end;
    const segmentHeight = segment.height || wallHeight;
    
    // Calculate the center point of the wall
    const centerX = (x1 + x2) / 2;
    const centerZ = (z1 + z2) / 2;
    
    // Calculate the length of the wall
    const length = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(z2 - z1, 2));
    
    // Calculate rotation (angle in radians)
    const angle = Math.atan2(z2 - z1, x2 - x1);
    
    // Y position is the baseY plus half the wall height
    const centerY = baseY + segmentHeight / 2;
    
    return (
      <RigidBody 
        key={`connected-wall-${index}`} 
        type="fixed" 
        colliders="cuboid"
        position={[centerX, centerY, centerZ]}
        rotation={[0, angle, 0]}
      >
        <mesh>
          <boxGeometry args={[length, segmentHeight, wallThickness]} />
          <meshStandardMaterial 
            color={wallColor} 
            transparent={!visible} 
            opacity={visible ? 0.5 : 0} 
          />
        </mesh>
      </RigidBody>
    );
  });

  return (
    <>
      {children}
      {walls}
    </>
  );
}; 