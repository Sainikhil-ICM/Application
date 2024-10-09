import { Global, Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import MailerService from 'src/services/mailer.service';
import ZohoService from 'src/services/zoho/zoho.service';
import Msg91Service from 'src/services/msg91.service';
import BondsService from 'src/services/bonds.service';
import IpoService from 'src/services/initial-public-offer.service';
import DigioService from 'src/services/digio/digio.service';
import UtilityService from 'src/services/utility.service';
import UserLogService from 'src/services/user-log/user-log.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UserLog, UserLogSchema } from 'src/models/user-log.model';
import UnlistedEquityService from 'src/services/unlisted-equity/unlisted-equity.service';
import MutualFundService from 'src/services/mutual-fund/mutual-fund.service';
import OnboardingService from 'src/services/onboarding/onboarding.service';
import ListedBondService from 'src/services/listed-bond/listed-bond.service';
import MarketLinkedDebentureService from 'src/services/market-linked-debenture/market-linked-debenture.service';
import { Customer, CustomerSchema, User, UserSchema } from 'src/models';

@Global()
@Module({
    imports: [
        HttpModule,
        MongooseModule.forFeature([
            { name: UserLog.name, schema: UserLogSchema },
            { name: Customer.name, schema: CustomerSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    providers: [
        UtilityService,
        Msg91Service,
        ZohoService,
        MailerService,
        BondsService,
        MutualFundService,
        OnboardingService,
        IpoService,
        DigioService,
        UserLogService,
        ListedBondService,
        UnlistedEquityService,
        MarketLinkedDebentureService,
    ],
    exports: [
        UtilityService,
        Msg91Service,
        ZohoService,
        MailerService,
        BondsService,
        MutualFundService,
        OnboardingService,
        IpoService,
        DigioService,
        UserLogService,
        ListedBondService,
        UnlistedEquityService,
        MarketLinkedDebentureService,
    ],
})
export class CommonModule {}
