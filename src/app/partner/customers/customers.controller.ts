import {
    Body,
    ClassSerializerInterceptor,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { PartnerGuard } from 'src/guards/partner.guard';
import { GetCustomersReqDto } from './dto/request/get-customers.req.dto';
import { AccountSession } from 'src/decorators/account-session.decorator';
import { CustomersService } from './customers.service';
import { CreateCustomerReqDto } from './dto/request/create-customer.req.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { UpdateCustomerReqDto } from './dto/request/update-customer.req.dto';
import { SessionAccount } from 'src/constants/account.const';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';

@Controller('partner/customers')
@UseGuards(PartnerGuard)
export class CustomersController {
    constructor(private customersService: CustomersService) {}

    @Get()
    @UseInterceptors(ClassSerializerInterceptor)
    getCustomers(@AccountSession() session: SessionAccount, @Query() query: GetCustomersReqDto) {
        const queryParams = { page: 1, per_page: 20, ...query };
        return this.customersService.getCustomers(session.account_id, queryParams);
    }

    @Post()
    @UseInterceptors(AnyFilesInterceptor())
    createCustomer(
        @AccountSession() session: SessionAccount,
        @Body() body: CreateCustomerReqDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.customersService.createCustomer(session, body, files);
    }

    @Get(':customer_id')
    getCustomer(@Param('customer_id') customer_id: string) {
        return this.customersService.getCustomer(customer_id);
    }

    @Patch(':customer_id')
    @UseInterceptors(AnyFilesInterceptor())
    updateCustomer(
        @Param('customer_id', MongoIdPipe) customer_id: string,
        @AccountSession() session: SessionAccount,
        @Body() body: UpdateCustomerReqDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        return this.customersService.updateCustomer(customer_id, session, body, files);
    }
}
