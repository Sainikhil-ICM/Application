import { IsDefined, IsMongoId } from 'class-validator';

export class InitResetPasswordDto {
    @IsDefined()
    @IsMongoId()
    user_id: string;
}
