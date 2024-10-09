import { IsDefined, IsMongoId, IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
    @IsDefined()
    @IsString()
    token: string;

    @IsDefined()
    @IsMongoId()
    user_id: string;

    @IsDefined()
    @IsString()
    @MinLength(8, { message: 'Password is too short' })
    password: string;
}
