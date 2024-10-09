import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString, MinLength } from 'class-validator';

export class UpdatePasswordDto {
    @IsDefined()
    @IsString()
    @MinLength(8, { message: 'Password is too short' })
    @ApiProperty({ example: 'passwordTest' })
    password: string;
}
