import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail } from 'class-validator';

export class ResendEmailOtpDto {
    @IsDefined()
    @IsEmail()
    @ApiProperty({ example: 'example@gmail.com' })
    email: string;
}
