import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserCreateEvent } from 'src/app/backend/users/events/user-create.event';
import { User, UserDocument } from 'src/models/user.model';
import { CreateVendorDto } from 'src/services/zoho/dto/create-vendor.dto';
import ZohoService from 'src/services/zoho/zoho.service';

@Injectable()
export class UserLogListener {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        private zohoService: ZohoService,
    ) {}

    @OnEvent('userLog.create')
    async handleUserCreate(params: UserCreateEvent) {
        const resCreateRecord = await this.zohoService.createRecord({
            recordType: 'Vendors',
            data: new CreateVendorDto(params),
        });

        console.log('🚀 ~ UserLogListener ~ handleUserCreate ~ resCreateRecord:', resCreateRecord);

        if (resCreateRecord) {
            const zohoRecordId = resCreateRecord[0].details.id;

            // Add the Zoho Record ID to the User document
            await this.userModel.findOneAndUpdate({ _id: params.id }, { zoho_id: zohoRecordId });
        }
    }
}
