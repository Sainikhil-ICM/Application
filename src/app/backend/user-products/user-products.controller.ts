import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { UserProductsService } from './user-products.service';
import { UserSession } from 'src/decorators/user-session.decorator';
import { SessionUser } from 'src/constants/user.const';
import { GetUserProductGroupsDto } from './dto/get-user-product-groups.dto';
import { AuthGuard } from 'src/guards/auth.guard';
import { CreateUserProductGroupDto } from './dto/create-user-product-group.dto';
import { GetUserProductsDto } from './dto/get-user-products.dto';
import { ProductType } from 'src/constants/product.const';

@Controller('user-products')
export class UserProductsController {
    constructor(private readonly userProductsService: UserProductsService) {}

    @Get()
    @UseGuards(AuthGuard)
    getUserProducts(
        @UserSession() session: SessionUser,
        @Query() getUserProductsDto: GetUserProductsDto,
    ) {
        return this.userProductsService.getUserProducts(session, getUserProductsDto);
    }

    @Get('groups')
    @UseGuards(AuthGuard)
    getUserProductGroups(
        @UserSession() session: SessionUser,
        @Query() getUserProductGroupsDto: GetUserProductGroupsDto,
    ) {
        return this.userProductsService.getUserProductGroups(session, getUserProductGroupsDto);
    }

    @Post(':product_type/groups')
    @UseGuards(AuthGuard)
    createUserProductGroup(
        @UserSession() session: SessionUser,
        @Param('product_type') productType: ProductType,
        @Body() createUserProductGroupDto: CreateUserProductGroupDto,
    ) {
        return this.userProductsService.createUserProductGroup(
            session,
            productType,
            createUserProductGroupDto,
        );
    }
}
