import { IsDefined, IsNumber, IsString } from 'class-validator';

export class CheckLocationDto {
    @IsDefined()
    @IsNumber()
    latitude: number;

    @IsDefined()
    @IsNumber()
    longitude: number;

    @IsDefined()
    @IsString()
    customer_id: string;
}
