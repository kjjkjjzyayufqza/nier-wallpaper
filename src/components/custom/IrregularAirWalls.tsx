import React, { ReactNode, Children, cloneElement, useMemo } from 'react';
import { ConnectedAirWalls } from './ConnectedAirWalls';

interface ModelConfig {
  /** Unique identifier for the model */
  id: string;
  /** Top Y position of this model (where walls should be placed) */
  topY: number;
}

interface ConnectionPoint {
  /** Model ID this point belongs to */
  modelId: string;
  /** Point coordinates [x, z] */
  point: [number, number];
}

interface BorderConnection {
  /** Points defining this border (in order) */
  points: ConnectionPoint[];
  /** Optional height override for this border */
  wallHeight?: number;
}

interface IrregularAirWallsProps {
  /** Children to render (the models) */
  children: ReactNode;
  /** Configuration for each model */
  models: ModelConfig[];
  /** Border connections between models */
  borders: BorderConnection[];
  /** Wall height (default: 5) */
  wallHeight?: number;
  /** Wall thickness (default: 0.2) */
  wallThickness?: number;
  /** Whether walls are visible (default: false) */
  visible?: boolean;
  /** Color of walls when visible (default: "red") */
  wallColor?: string;
}

/**
 * IrregularAirWalls allows for definition of custom borders between irregular models.
 * It creates air walls following the exact borders defined by points.
 */
export const IrregularAirWalls: React.FC<IrregularAirWallsProps> = ({
  children,
  models,
  borders,
  wallHeight = 5,
  wallThickness = 0.2,
  visible = false,
  wallColor = "red",
}) => {
  // Create a map of model IDs to their configurations for quick lookup
  const modelMap = useMemo(() => {
    const map = new Map<string, ModelConfig>();
    models.forEach(model => {
      map.set(model.id, model);
    });
    return map;
  }, [models]);

  // Clone children to render them unchanged
  const clonedChildren = useMemo(() => {
    return Children.map(children, child => cloneElement(child as React.ReactElement));
  }, [children]);

  // Create ConnectedAirWalls for each model based on the border definitions
  const airWallsComponents = useMemo(() => {
    // Group segments by model ID
    const modelSegments = new Map<string, { baseY: number, segments: Array<{ start: [number, number], end: [number, number], height?: number }> }>();
    
    // Initialize map with empty segments arrays for all models
    models.forEach(model => {
      modelSegments.set(model.id, { baseY: model.topY, segments: [] });
    });
    
    // Process each border to create wall segments
    borders.forEach(border => {
      const { points, wallHeight: borderWallHeight } = border;
      
      // Need at least 2 points to form a segment
      if (points.length < 2) return;
      
      // Create segments between consecutive points
      for (let i = 0; i < points.length - 1; i++) {
        const pointA = points[i];
        const pointB = points[i + 1];
        
        // If points belong to different models, create segments for both
        if (pointA.modelId !== pointB.modelId) {
          // Add segment to model A
          const modelASegments = modelSegments.get(pointA.modelId);
          if (modelASegments) {
            modelASegments.segments.push({
              start: pointA.point,
              end: pointB.point,
              height: borderWallHeight
            });
          }
          
          // Add segment to model B
          const modelBSegments = modelSegments.get(pointB.modelId);
          if (modelBSegments) {
            modelBSegments.segments.push({
              start: pointB.point,
              end: pointA.point,
              height: borderWallHeight
            });
          }
        } else {
          // Both points belong to the same model
          const modelSegmentData = modelSegments.get(pointA.modelId);
          if (modelSegmentData) {
            modelSegmentData.segments.push({
              start: pointA.point,
              end: pointB.point,
              height: borderWallHeight
            });
          }
        }
      }
      
      // If the border is a closed loop, connect the last point back to the first
      if (points.length > 2) {
        const firstPoint = points[0];
        const lastPoint = points[points.length - 1];
        
        if (firstPoint.modelId === lastPoint.modelId) {
          const modelSegmentData = modelSegments.get(firstPoint.modelId);
          if (modelSegmentData) {
            modelSegmentData.segments.push({
              start: lastPoint.point,
              end: firstPoint.point,
              height: borderWallHeight
            });
          }
        }
      }
    });
    
    // Create ConnectedAirWalls for each model
    return Array.from(modelSegments.entries()).map(([id, { baseY, segments }]) => {
      if (segments.length === 0) return null;
      
      return (
        <ConnectedAirWalls
          key={`irregular-air-walls-${id}`}
          baseY={baseY}
          segments={segments}
          wallHeight={wallHeight}
          wallThickness={wallThickness}
          visible={visible}
          wallColor={wallColor}
          children={<></>}
        >
          {/* No children here since we're rendering them at the parent level */}
        </ConnectedAirWalls>
      );
    }).filter(Boolean);
  }, [models, borders, wallHeight, wallThickness, visible, wallColor]);

  return (
    <>
      {clonedChildren}
      {airWallsComponents}
    </>
  );
}; 