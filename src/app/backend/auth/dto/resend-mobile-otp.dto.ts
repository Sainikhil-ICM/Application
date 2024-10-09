import { ApiProperty } from '@nestjs/swagger';
import { IsDefined, IsString } from 'class-validator';

export class ResendMobileOtpDto {
    @IsDefined()
    @IsString()
    @ApiProperty({ example: '8769009981' })
    phone_number: string;
}
