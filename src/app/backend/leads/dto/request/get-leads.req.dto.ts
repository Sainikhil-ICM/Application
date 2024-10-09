import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsString } from 'class-validator';
import { LeadStatus } from 'src/constants/lead.const';

export default class GetLeadsReqDto {
    @IsString()
    @IsEnum(LeadStatus)
    readonly status: string;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly page = 1;

    @IsInt()
    @Transform(({ value }) => Math.max(1, value))
    readonly per_page = 10;
}
