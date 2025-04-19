import React, { ReactElement, useRef, ReactNode, useMemo, useEffect, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { RigidBody } from '@react-three/rapier';
import * as THREE from 'three';
import { AirWalls } from './AirWalls';

interface AirWallsWrapperProps {
  /**
   * The content to wrap with air walls. This can be a single mesh or a 
   * hierarchy of objects containing meshes.
   */
  children: ReactNode;
  
  /**
   * Height of the air walls from the top surface of the mesh.
   * @default 5
   */
  wallHeight?: number;
  
  /**
   * Thickness of the air walls.
   * @default 0.2
   */
  wallThickness?: number;
  
  /**
   * Whether to make the air walls visible (for debugging).
   * @default false
   */
  visible?: boolean;
  
  /**
   * Color of the air walls when visible.
   * @default "red"
   */
  wallColor?: string;
  
  /**
   * Only generate air walls for objects with names matching this filter.
   * If not provided, all meshes will get air walls.
   */
  nameFilter?: string | RegExp;
  
  /**
   * Margin for the air walls relative to the mesh size.
   * @default 0 (exactly at the edge)
   */
  margin?: number;
  
  /**
   * Enable/disable the air walls.
   * @default true
   */
  enabled?: boolean;
}

/**
 * AirWallsWrapper - A component that automatically adds air walls around any Three.js meshes
 * contained within it. Works by analyzing the scene graph at runtime.
 */
export const AirWallsWrapper: React.FC<AirWallsWrapperProps> = ({
  children,
  wallHeight = 5,
  wallThickness = 0.2,
  visible = false,
  wallColor = "red",
  nameFilter,
  margin = 0,
  enabled = true,
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const [meshData, setMeshData] = useState<Array<{ position: [number, number, number], size: [number, number, number] }>>([]);
  const { scene } = useThree();
  
  // Analyze the scene to find all relevant meshes
  // Use an effect to analyze the scene structure once
  useEffect(() => {
    if (!groupRef.current || !enabled) return;
    
    // Use a timeout to ensure all scene objects are properly positioned
    const timer = setTimeout(() => {
      const meshesData: Array<{ position: [number, number, number], size: [number, number, number] }> = [];
      
      // Traverse the group to find all meshes
      groupRef.current?.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          // Apply name filter if provided
          if (nameFilter) {
            if (typeof nameFilter === 'string' && object.name !== nameFilter) return;
            if (nameFilter instanceof RegExp && !nameFilter.test(object.name)) return;
          }
          
          // Compute the object's bounding box (will take into account all geometry)
          object.geometry.computeBoundingBox();
          const boundingBox = object.geometry.boundingBox;
          
          if (boundingBox) {
            // Get the world matrix to calculate the true position and size
            object.updateWorldMatrix(true, false);
            const worldMatrix = object.matrixWorld;
            
            // Calculate the center position in world coordinates
            const center = new THREE.Vector3();
            boundingBox.getCenter(center);
            center.applyMatrix4(worldMatrix);
            
            // Calculate the size of the bounding box
            const size = new THREE.Vector3();
            boundingBox.getSize(size);
            
            // Apply the object's scale to the size
            size.x *= object.scale.x;
            size.y *= object.scale.y;
            size.z *= object.scale.z;
            
            // Add to our collection
            meshesData.push({
              position: [center.x, center.y, center.z],
              size: [size.x, size.y, size.z],
            });
          }
        }
      });
      
      setMeshData(meshesData);
    }, 100); // Wait 100ms to ensure all objects are properly positioned
    
    return () => clearTimeout(timer);
  }, [enabled, nameFilter]);

  // Generate air walls based on found meshes
  const airWalls = useMemo(() => {
    if (!enabled || meshData.length === 0) return null;
    
    return meshData.map((data, index) => (
      <AirWalls
        key={`auto-air-walls-${index}`}
        position={data.position}
        dimensions={data.size}
        wallHeight={wallHeight}
        wallThickness={wallThickness}
        visible={visible}
        wallColor={wallColor}
      />
    ));
  }, [meshData, wallHeight, wallThickness, visible, wallColor, enabled]);

  return (
    <>
      <group ref={groupRef}>{children}</group>
      {airWalls}
    </>
  );
};
