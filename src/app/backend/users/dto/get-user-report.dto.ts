import { Transform } from "class-transformer";
import { IsInt } from "class-validator";

export class GetUserReportDto {
    @IsInt()
    @Transform(({value}) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({value}) => Math.max(1, value))
    readonly per_page = 10;
}