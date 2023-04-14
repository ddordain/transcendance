import { IObject } from './interfaces/IObject';
import { Vector3 } from './utils/Vector3';
import { baseCollide } from './utils/collisions/baseColide';

export class Ball extends IObject {
  private _speed: Vector3;
  private _initialSpeed: Vector3;

  public constructor(
    width: number,
    height: number,
    depth: number,
    position: Vector3,
    speed: Vector3,
  ) {
    super(width, height, depth, position);
    this._initialSpeed = speed;
    this._speed = speed;
  }

  public set speed(value: Vector3) {
    this._speed = value;
  }

  public get speed(): Vector3 {
    return this._speed;
  }

  public resetSpeed() {
    this._speed = this._initialSpeed;
  }

  public update(deltaTime: number) {
    //if we assume speed is in m/s unit
    const position = this.getPosition();
    position.x += this._speed.x * deltaTime;
    position.y += this._speed.y * deltaTime;
    position.z += this._speed.z * deltaTime;
    this.setPosition(position);
  }

  public collide() {
    // baseCollide();
  }
}
