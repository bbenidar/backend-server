import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

async validateUser(email: string, pass: string): Promise<any> {
  const user = await this.userService.findByEmail(email);
  if (!user) throw new UnauthorizedException('Invalid credentials');

  console.log('Stored hash:', user.password);
  console.log('Input password:', pass);
  
  const passwordValid = await bcrypt.compare(pass, user.password);
  if (!passwordValid) throw new UnauthorizedException('Invalid cttredentials');

  return user; 
}

async login(user: any) {
  const payload = { 
    email: user.email, 
    sub: user.userid
  };
  return {
    access_token: this.jwtService.sign(payload),
  };
}
}

