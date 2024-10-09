import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsEmail } from 'class-validator';

export class CreateSessionDto {
    @IsDefined()
    @IsEmail()
    @ApiProperty({ example: 'example@gmail.com' })
    email: string;

    @ApiProperty({ example: 'example007' })
    @IsDefined()
    password: string;
}
