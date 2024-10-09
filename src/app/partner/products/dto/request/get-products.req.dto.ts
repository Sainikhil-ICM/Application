import { IsEnum, IsString } from 'class-validator';

export default class GetProductsReqDto {
    @IsString()
    @IsEnum({
        LIVE: 'live',
        UPCOMING: 'upcoming',
        HISTORICAL: 'historical',
    })
    category: string;
}
