import React from "react";
import { COLORS } from "../../../colors";
import { Vector3 } from "three";

function Walls(props) {
  return (
    <>
      {props.walls.map((wall) => {
        return (
          <mesh
            position={
              new Vector3(
                wall._initialPosition._x,
                wall._initialPosition._y,
                wall._initialPosition._z
              )
            }
          >
            <boxGeometry
              args={[
                wall._hitBox._width,
                wall._hitBox._height,
                wall._hitBox._depth,
              ]}
            />
            <meshToonMaterial
              color={COLORS.green}
              emissive="purple"
              emissiveIntensity={10}
              opacity={0.3}
              transparent
            />
          </mesh>
        );
      })}
    </>
  );
}

export default Walls;