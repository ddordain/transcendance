import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { AuthService } from "../auth.service";
import { LocalLogDto } from "../dto/log-user.dto";

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
    constructor(private authService: AuthService){
        super(); // config for the strategy, not much needed here for local strategy 
    }

    //An equivalent can be to use a VerifyCallback that will do this for us (depending on the strategy we use)
    async validate(username: string, password: string): Promise<any> {
        const localLogDto: LocalLogDto = {username, password};
        const user = await this.authService.validateUser(localLogDto);

        if (!user) {
            throw new UnauthorizedException();
        }

        return user;
    }
}