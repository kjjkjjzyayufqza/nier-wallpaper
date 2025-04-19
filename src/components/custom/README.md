# Air Walls Components

This directory contains components for automatically generating invisible barriers ("air walls") around the perimeters of 3D objects in your React Three Fiber scene.

## Overview

When creating 3D environments with platforms, it's often necessary to add invisible walls around the edges to prevent the player from falling off. These components make this task easy by automatically calculating and placing these barriers.

## Components

### 1. AirWalls

The basic component that creates air walls around a mesh based on explicitly provided position and dimensions.

```tsx
<AirWalls 
  position={[0, 0, 0]} 
  dimensions={[10, 1, 10]} 
  wallHeight={3} 
  wallThickness={0.2}
  visible={false} 
  wallColor="red"
/>
```

#### Props

- `position`: [x, y, z] - The position of the base mesh
- `dimensions`: [width, height, depth] - The dimensions of the base mesh
- `wallHeight`: (optional) Height of the air walls (default: 5)
- `wallThickness`: (optional) Thickness of the air walls (default: 0.2)
- `visible`: (optional) Whether to make the walls visible for debugging (default: false)
- `wallColor`: (optional) Color of the walls when visible (default: "red")

### 2. AutoAirWalls

A higher-level component that wraps meshes and automatically extracts their position and dimensions to create air walls.

```tsx
<AutoAirWalls visible={false} wallHeight={3}>
  <mesh position={[0, 0, 0]}>
    <boxGeometry args={[10, 1, 10]} />
    <meshStandardMaterial color="#CBC6AF" />
  </mesh>
</AutoAirWalls>
```

#### Props

- `children`: The mesh elements to wrap with air walls
- `wallHeight`: (optional) Height of the air walls (default: 5)
- `wallThickness`: (optional) Thickness of the air walls (default: 0.2)
- `visible`: (optional) Whether to make the walls visible for debugging (default: false)
- `wallColor`: (optional) Color of the walls when visible (default: "red")

### 3. AirWallsWrapper

The most advanced component that can analyze complex hierarchies of objects, using Three.js scene traversal to find all meshes and create appropriate air walls.

```tsx
<AirWallsWrapper 
  visible={false} 
  wallHeight={3}
  nameFilter="platform"
>
  <group>
    <mesh position={[0, 0, 0]} name="platform">
      <boxGeometry args={[10, 1, 10]} />
      <meshStandardMaterial />
    </mesh>
    {/* Can contain complex nested structures */}
  </group>
</AirWallsWrapper>
```

#### Props

- `children`: The elements to analyze for meshes that need air walls
- `wallHeight`: (optional) Height of the air walls (default: 5)
- `wallThickness`: (optional) Thickness of the air walls (default: 0.2)
- `visible`: (optional) Whether to make the walls visible for debugging (default: false)
- `wallColor`: (optional) Color of the walls when visible (default: "red")
- `nameFilter`: (optional) Only generate air walls for meshes with names matching this filter
- `margin`: (optional) Additional margin around edges (default: 0)
- `enabled`: (optional) Enable/disable the air walls (default: true)

## Usage Tips

1. **For simple cases** where you know the exact dimensions of your platform, use `AirWalls` directly.

2. **For single meshes** where the dimensions are defined in the geometry, use `AutoAirWalls` to automatically extract them.

3. **For complex scenes** with multiple platforms or nested object hierarchies, use `AirWallsWrapper` which will analyze the scene graph.

4. **For debugging**, set `visible={true}` to see the air walls rendered as semi-transparent barriers.

5. **Toggle visibility** dynamically to help with level design and debugging:

```tsx
const [showWalls, setShowWalls] = useState(false);

// Later in your component
<AirWallsWrapper visible={showWalls} {...otherProps}>
  {/* Your scene content */}
</AirWallsWrapper>
```

## Implementation Details

- Air walls are created using `RigidBody` components from @react-three/rapier with fixed colliders
- The walls are placed at the top perimeter of the target mesh
- By default, they're invisible but can be made visible for debugging
- Physics collisions work even when the walls are invisible
