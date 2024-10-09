import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { UserStatus } from 'src/constants/user.const';

export class GetUserProductsDto {
    @IsString()
    product_isin: string;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly per_page = 10;

    @IsEnum(UserStatus)
    readonly status: UserStatus;
}
