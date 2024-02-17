import { Controller } from '@nestjs/common';
import { AuthService } from 'src/internal-modules/auth/auth.service';

@Controller('auth-api')
export class AuthApiController {
  constructor(private readonly authService: AuthService) {}
}
