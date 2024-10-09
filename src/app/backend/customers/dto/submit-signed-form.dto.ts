import { IsDefined, IsString } from 'class-validator';

export class SubmitSignedFormDto {
    @IsDefined()
    @IsString()
    customer_id: string;

    @IsDefined()
    @IsString()
    signed_form_link: string;
}
