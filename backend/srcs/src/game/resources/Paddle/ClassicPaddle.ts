import { EType } from 'shared/enum';
import { Ball } from '../Ball/Ball';
import { TCollision } from '../types';
import { baseCollide } from '../utils/collisions/baseColide';
import { IPaddle } from './IPaddle';

export class ClassicPaddle extends IPaddle {
  // public collide(ball: Ball): TCollision {
  //     const collision = baseCollide(ball, this._hitBox);
  //     return { ...collision, type: EType.CLASSIC_PADDLE };
  // }
}
