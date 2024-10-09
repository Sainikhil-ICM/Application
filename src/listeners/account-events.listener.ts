import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AccountCreateEvent } from 'src/app/backend/accounts/events/account-create.event';
import { Account, AccountDocument } from 'src/models/account.model';

@Injectable()
export class AccountEventsListener {
    constructor(
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
    ) {}

    @OnEvent('account.create')
    async handleAccountCreate(params: AccountCreateEvent) {
        console.log('🚀 ~ AccountEventsListener ~ handleAccountCreate ~ params:', params);
    }
}
