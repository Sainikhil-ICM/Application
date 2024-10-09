import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsDefined } from 'class-validator';

export class ForgotPasswordDto {
    @IsDefined()
    @IsEmail()
    @ApiProperty({ example: 'example@gmail.com' })
    email: string;
}
