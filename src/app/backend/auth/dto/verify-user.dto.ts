import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsMongoId, MinLength } from 'class-validator';

export class VerifyUserDto {
    @IsDefined()
    @IsMongoId()
    @ApiProperty({ example: '64ed87b52c3f289e486d05f' })
    user_id: string;

    @IsDefined()
    @MinLength(4)
    @ApiProperty({ example: '1234' })
    email_otp: string;

    @IsDefined()
    @MinLength(4)
    @ApiProperty({ example: '6789' })
    phone_otp: string;
}
