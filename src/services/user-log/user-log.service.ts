import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserLog, UserLogDocument } from 'src/models/user-log.model';
import { CreateUserLogDto } from './dto/create-user-log.dto';
import { ResProps1 } from 'types';

@Injectable()
export default class UserLogService {
    constructor(
        @InjectModel(UserLog.name)
        private readonly userLogModel: Model<UserLogDocument>,
    ) {}

    async create(params: CreateUserLogDto): Promise<ResProps1<UserLogDocument>> {
        const userLog = new this.userLogModel();
        userLog.set('record_id', params.record_id);
        userLog.set('record_collection', params.record_collection);
        userLog.set('record_action', params.record_action);
        // userLog.set('record_before', params.record_before);
        // userLog.set('record_after', params.record_after);
        userLog.set('user_id', params.user_id);
        userLog.set('account_id', params.account_id);
        await userLog.save();

        return { success: true, data: userLog };
    }

    // async get(): Promise<any> {}
}
