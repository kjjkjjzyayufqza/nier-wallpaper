import React, { ReactElement, Children, cloneElement, useMemo, JSXElementConstructor } from 'react';
import { AirWalls, AirWallSides } from './AirWalls';
import { Vector3, Box3 } from 'three';
import { useThree } from '@react-three/fiber';

interface GeometryProps {
  args?: [number, number, number];
}

interface MeshProps {
  position?: [number, number, number];
  children?: ReactElement<GeometryProps> | ReactElement<GeometryProps>[];
}

interface AutoAirWallsProps {
  /** Children (should be a mesh or multiple meshes) */
  children: ReactElement<MeshProps, string | JSXElementConstructor<any>> | ReactElement<MeshProps, string | JSXElementConstructor<any>>[];
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
 * AutoAirWalls component automatically adds air walls to the top perimeter
 * of any mesh passed as a child. It extracts the position and dimensions from 
 * the mesh's props and geometry.
 */
export const AutoAirWalls: React.FC<AutoAirWallsProps> = ({
  children,
  wallHeight = 5,
  wallThickness = 0.2,
  visible = false,
  wallColor = "red",
  sides
}) => {
  // Clone the children to render them unchanged
  const clonedChildren = useMemo(() => {
    return Children.map(children, (child) => cloneElement(child));
  }, [children]);

  const airWalls = useMemo(() => {
    return Children.map(children, (child, index) => {
      // Extract position and geometry args from the mesh
      const childProps = child.props as MeshProps;
      const position = childProps.position || [0, 0, 0];
      
      // Try to find geometry args by traversing the children
      let geometryArgs: [number, number, number] = [1, 1, 1];
      
      // Check if child has children with props.args (for boxGeometry)
      if (childProps.children) {
        if (Array.isArray(childProps.children)) {
          // If children is an array (multiple elements like geometry + material)
          Children.forEach(childProps.children as React.ReactNode, (childElement) => {
            if (React.isValidElement(childElement)) {
              const geometryProps = childElement.props as GeometryProps;
              if (geometryProps && geometryProps.args) {
                // Found a geometry with args
                geometryArgs = geometryProps.args;
              }
            }
          });
        } else if (React.isValidElement(childProps.children)) {
          // If children is a single element
          const geometry = childProps.children;
          const geometryProps = geometry.props as GeometryProps;
          if (geometryProps && geometryProps.args) {
            geometryArgs = geometryProps.args;
          }
        }
      }
      
      // Return air walls for this mesh
      return (
        <AirWalls
          key={`auto-air-walls-${index}`}
          position={position}
          dimensions={geometryArgs}
          wallHeight={wallHeight}
          wallThickness={wallThickness}
          visible={visible}
          wallColor={wallColor}
          sides={sides}
        />
      );
    });
  }, [children, wallHeight, wallThickness, visible, wallColor]);

  return (
    <>
      {clonedChildren}
      {airWalls}
    </>
  );
};
