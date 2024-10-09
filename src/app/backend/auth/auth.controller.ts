import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { AuthService } from './auth.service';
import { UserSession } from 'src/decorators/user-session.decorator';
import { CreateUserDto } from './dto/create-user.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ResendMobileOtpDto } from './dto/resend-mobile-otp.dto';
import { ResendEmailOtpDto } from './dto/resend-email-otp.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { SessionUser } from 'src/constants/user.const';
import { UpdateUserReqDto } from './dto/update-user.req.dto';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { ValidatePanNumberDto } from './dto/validate-pan-number.dto';
import { InitResetPasswordDto } from './dto/init-reset-password.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('pan/validate')
    validatePanNumber(@Body() validatePanNumberDto: ValidatePanNumberDto) {
        return this.authService.validatePanNumber(validatePanNumberDto);
    }

    @Get('user')
    @UseGuards(AuthGuard)
    getSessionUser(@UserSession() session: SessionUser) {
        return this.authService.getSessionUser(session);
    }

    @Get('tokens/:token_id')
    getTokenDetails(@Param('token_id') token_id: string) {
        return this.authService.getTokenDetails(token_id);
    }

    @Post('register')
    createUser(@Body() params: CreateUserDto) {
        return this.authService.createUser(params);
    }

    @Post('resend-mobile-otp')
    resendMobileOTP(@Body() body: ResendMobileOtpDto) {
        return this.authService.resendMobileOTP(body);
    }

    @Post('resend-email-otp')
    resendEmailOTP(@Body() body: ResendEmailOtpDto) {
        return this.authService.resendEmailOTP(body);
    }

    @Post('register/verify')
    verifyUser(@Body() params: VerifyUserDto) {
        return this.authService.verifyUser(params);
    }

    @Post('register/password')
    @UseGuards(AuthGuard)
    updatePassword(@UserSession() user: SessionUser, @Body() params: UpdatePasswordDto) {
        return this.authService.updatePassword(user, params);
    }

    @Post('login')
    createSession(@Body() params: CreateSessionDto) {
        return this.authService.createSession(params);
    }

    @Post('forgot-password')
    forgotPassword(@Body() params: ForgotPasswordDto) {
        return this.authService.forgotPassword(params);
    }

    @Post('init-reset-password')
    initResetPassword(@Body() initResetPasswordDto: InitResetPasswordDto) {
        return this.authService.initResetPassword(initResetPasswordDto);
    }

    @Post('reset-password')
    resetPassword(@Body() params: ResetPasswordDto) {
        return this.authService.resetPassword(params);
    }

    @Patch('register/:user_id')
    updateUser(@Param('user_id', MongoIdPipe) user_id: string, @Body() body: UpdateUserReqDto) {
        return this.authService.updateUser(user_id, body);
    }
}
