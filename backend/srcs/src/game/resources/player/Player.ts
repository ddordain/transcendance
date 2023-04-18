import { BasePaddle } from '../paddle/BasePaddle';
import { ChampionsPaddle } from '../paddle/ChampionsPaddle';
import { IPaddle } from '../paddle/IPaddle';
import { Vector3 } from '../utils/Vector3';
import { EPaddle } from '../utils/config/enums';

export class Player {
  private _paddle: IPaddle;
  private _id: string;
  private _team: boolean;
  private _ready: boolean;

  public constructor(
    id: string,
    team: boolean,
    paddleType: EPaddle,
    config: any
  ) {
    this._id = id;
    this._team = team;
    this._ready = false;
    switch (paddleType) {
      case EPaddle.BASIC:
        this._paddle = new BasePaddle({...config.paddle, position: new Vector3(0, 0, team ? config.depth / 2 : -(config.depth / 2))});      
        break;
      case EPaddle.CHAMPIONS:
        this._paddle = new ChampionsPaddle({...config.paddle, position: new Vector3(0, 0, team ? config.depth / 2 : -(config.depth / 2))});      
        break;
    }
  }

  public set ready(ready: boolean) {
    this._ready = ready;
  }
  public get ready(): boolean {
    return this._ready;
  }
  public get id(): string {
    return this._id;
  }

  public get team(): boolean {
    return this._team;
  }

  public get paddle(): IPaddle {
    return this._paddle;
  }
}
