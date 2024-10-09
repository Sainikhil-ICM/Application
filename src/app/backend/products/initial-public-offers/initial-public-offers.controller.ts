import {
    Controller,
    Get,
    Param,
    UseGuards,
    Query,
    UseInterceptors,
    ClassSerializerInterceptor,
} from '@nestjs/common';
import { InitialPublicOffersService } from './initial-public-offers.service';
import { UserSession } from 'src/decorators/user-session.decorator';
import { AuthGuard } from 'src/guards/auth.guard';
import { SessionUser } from 'src/constants/user.const';
import GetProductsDto from './dto/get-products.dto';
import { GetCustomersDto } from './dto/get-customers.dto';

@Controller('initial-public-offers')
export class InitialPublicOffersController {
    constructor(private readonly listedBondsService: InitialPublicOffersService) {}

    @Get('products')
    @UseInterceptors(ClassSerializerInterceptor)
    getProducts(@Query() getProductsDto: GetProductsDto) {
        return this.listedBondsService.getProducts(getProductsDto);
    }

    @Get('products/:isin')
    @UseInterceptors(ClassSerializerInterceptor)
    getProduct(@Param('isin') isin: string) {
        return this.listedBondsService.getProduct(isin);
    }

    @Get('customers')
    @UseGuards(AuthGuard)
    getCustomers(@UserSession() session: SessionUser, @Query() getCustomersDto: GetCustomersDto) {
        return this.listedBondsService.getCustomers(session, getCustomersDto);
    }
}
