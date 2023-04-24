import { Texture, Vector3 } from "three";
import { Object3D } from "./interfaces";
import { Grid } from "@react-three/drei";
import { Mesh } from "three";
import { EType } from "../../../../shared/enum";
import { PerspectiveCamera } from "@react-three/drei";
import { Trail } from "@react-three/drei";
import { GridCustom } from "./custom/GridCustom";
import { Euler, RepeatWrapping } from "three";
import { useTexture } from "@react-three/drei";

const PADDLE_COLORS = {
  [EType.CLASSIC_PADDLE]: {
    color: "#fffff",
    emissive: "white",
    emissiveIntensity: 4,
  },

  [EType.RED_PADDLE]: {
    color: "#f69090",
    emissive: "red",
    emissiveIntensity: 4,
  },
  [EType.ORANGE_PADDLE]: {
    color: "#ff6a00",
    emissive: "#d9750b",
    emissiveIntensity: 4,
  },
  [EType.PURPLE_PADDLE]: {
    color: "#f1c5ff",
    emissive: "#bd0af4",
    emissiveIntensity: 4,
  },
  [EType.GREEN_PADDLE]: {
    color: "#21f40a",
    emissive: "#21f40a",
    emissiveIntensity: 4,
  },
  [EType.BLUE_PADDLE]: {
    color: "#0aaaf4",
    emissive: "#0aaaf4",
    emissiveIntensity: 4,
  },
};

export function createMeshComponent(
  object: Object3D,
  ref: React.RefObject<Mesh> | null,
  isActive: boolean | false
) {
  const position = new Vector3(
    object.position.x,
    object.position.y,
    object.position.z
  );

  const materialProps: any = {};
  let texture: Texture;

  if (object.texture) {
    texture = useTexture(object.texture);
    texture.wrapS = RepeatWrapping;
    texture.wrapT = RepeatWrapping;
  
    const squareSize = Math.max(texture.image.width, texture.image.height) / 64;
    const repeatX = (object.width / squareSize);
    const repeatY = (object.depth / squareSize);
  
    texture.repeat.set(repeatX, repeatY);
    materialProps.map = texture;
  }

  // console.log(object.type);

  switch (object.type) {
    /*================================ PADDLE ==============================*/

    case EType.CLASSIC_PADDLE:
    case EType.PADDLE:
    case EType.RED_PADDLE:
    case EType.ORANGE_PADDLE:
    case EType.PURPLE_PADDLE:
    case EType.GREEN_PADDLE:
    case EType.BLUE_PADDLE:
      const colorConfig = PADDLE_COLORS[object.type];

      return (
        <mesh ref={ref} position={position}>
          <boxGeometry args={[object.width, object.height, object.depth]} />
          <meshToonMaterial
            color={colorConfig.color}
            emissive={colorConfig.emissive}
            emissiveIntensity={colorConfig.emissiveIntensity}
            opacity={0.7}
            transparent={true}
          />
          {isActive && (
            <PerspectiveCamera
              makeDefault={true}
              position={position}
              fov={100}
            />
          )}
        </mesh>
      );

    /*================================ BALL ==============================*/

    case EType.SPHERE:
      if (!object.texture) {
        materialProps.emissive = "blue";
        materialProps.emissiveIntensity = 10;
        materialProps.toneMapped = false;
      } else {
        materialProps.roughness = 0.5;
        materialProps.metalness = 0.5;
      }
      return (
        <mesh ref={ref} position={position} args={[]}>
          <sphereGeometry args={[object.width, 32, 32]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );

    /*================================ WALL ==============================*/

    case EType.GRID:
      const rotation =
        object.width === 1 ? new Euler(0, 0, Math.PI / 2) : new Euler(0, 0, 0);
      const gridWidth = rotation.z === 0 ? object.width : object.height;
      const gridLength = object.depth;
      return (
        <mesh position={position}>
          <GridCustom
            gridWidth={gridWidth}
            gridLength={gridLength}
            rotation={rotation}
          />
        </mesh>
      );

    case EType.BOX:
      if (!object.texture) {
        materialProps.color = "white";
      }
      return (
        <mesh position={position}>
          <boxGeometry args={[object.width, object.height, object.depth]} />
          <meshStandardMaterial {...materialProps} />
        </mesh>
      );
    /*================================ END ==============================*/

    default:
      return null;
  }
}
