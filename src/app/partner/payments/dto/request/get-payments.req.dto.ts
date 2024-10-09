import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { OrderStatus } from 'src/constants/payment.const';

export class GetPamentsReqDto {
    @IsString()
    @IsEnum({ ...OrderStatus, PENDING: 'PENDING' })
    status: string;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    page: number;

    @IsInt()
    @Transform(({ value }) => parseInt(value))
    per_page: number;
}
