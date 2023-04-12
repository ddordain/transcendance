import { Vector3 } from '../Vector3';

export const BasePaddleConfig = {
  width: 2,
  height: 2,
  depth: 0.1,
};

export const BallConfig = {
  width: 0.5,
  height: 0.5,
  depth: 0.5,
  position: new Vector3(0, 0, 0),
  speed: new Vector3(0, 0, 1),
};

export const BaseFieldConfig = {
  width: 16,
  height: 9,
  depth: 35,
  VerticalWallConfig: {
    width: 0.1,
    height: 9,
    depth: 35,
  },
  HorizontalWallConfig: {
    width: 16,
    height: 0.1,
    depth: 35,
  },
};