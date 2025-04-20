import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: { email: string; password: string }) {
    console.log('Login DT============O:', loginDto);
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    console.log('User after validation:', user);
    return user;
  }
}