import { Injectable } from '@nestjs/common';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { UserProfilesRepository } from './user-profiles.repository';
import { SessionUser, UserRole, UserStatus } from 'src/constants/user.const';
import AttachmentService from 'src/services/attachment.service';
import { Account, AccountDocument, AttachmentDocument, UserProfileDocument } from 'src/models';
import { ResProps1 } from 'types';
import { AttachmentType } from 'src/constants/attachment.const';
import { User, UserDocument } from 'src/models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserRegistrationEvent } from '../users/events/user-registration.event';
import { PinCodeData } from 'src/constants/pin-code.const';
import PinCodeService from 'src/services/pin-code/pin-code.service';
import { UserProfileStatus } from 'src/constants/user-profile.const';
import MailerService from 'src/services/mailer.service';
import { ConfigService } from '@nestjs/config';
import { UserRegistrationAcceptEvent } from '../users/events/user-registration-accept.event';
import { UserRegistrationRejectEvent } from '../users/events/user-registration-reject-event';
import { ExportUsersDto } from './dto/export-advisors-data.dto';
import { format } from 'date-fns';
import { UsersRepository } from '../users/users.repository';
import { CryptoService } from 'src/services/crypto.service';

@Injectable()
export class UserProfilesService {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        @InjectModel(Account.name)
        private accountModel: Model<AccountDocument>,
        private readonly eventEmitter: EventEmitter2,
        private readonly userProfilesRepository: UserProfilesRepository,
        private readonly usersRepository: UsersRepository,
        private readonly attachmentService: AttachmentService,
        private readonly pinCodeService: PinCodeService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        private readonly cryptoService: CryptoService,
    ) {}

    async createUserProfile(session: SessionUser, createUserProfileDto: CreateUserProfileDto) {
        console.log(
            '🚀 ~ UserProfilesService ~ createUserProfile ~ createUserProfileDto:',
            createUserProfileDto,
        );

        const userProfile = await this.userProfilesRepository.createUserProfile({
            ...createUserProfileDto,
            user_id: session.user_id,
            account_id: session.account_id,
        });

        if (createUserProfileDto.is_consent_given) {
            const user = await this.userModel.findOneAndUpdate(
                { _id: session.user_id, account_id: session.account_id },
                { status: UserStatus.REGISTRATION_COMPLETED },
                { upsert: true, background: true, new: true },
            );

            const accountDetails = await this.accountModel.findById(session.account_id);

            this.eventEmitter.emit(
                'user.registration',
                new UserRegistrationEvent({
                    name: user.name,
                    email: user.email,
                    id: session.user_id,
                    logo_url: accountDetails.logo.url,
                }),
            );
        }

        return {
            success: true,
            data: userProfile,
        };
    }

    async uploadAttachment(
        session: SessionUser,
        files: Express.Multer.File[],
    ): Promise<ResProps1<AttachmentDocument>> {
        if (files && files.length) {
            // upload attachment file
            const attachmentType = files[0].fieldname as AttachmentType;

            const attachment = await this.attachmentService.upsertCustomAttachment(files[0], {
                path: `user-profiles/${session.user_id}/${attachmentType}`,
                account_id: session.account_id,
                user_id: session.user_id,
                type: attachmentType,
            });
            debugger;
            // save the reference of the attachment on the resource
            return {
                success: true,
                data: attachment,
            };
        } else {
            return {
                success: false,
                message: 'No file selected',
            };
        }
    }

    getUserProfiles() {
        return 'this.userProfilesRepository.find({});';
    }

    async getUserProfile(user_id: string): Promise<ResProps1<UserProfileDocument>> {
        const userProfile = await this.userProfilesRepository.getUserProfile({ user_id });

        if (!userProfile) {
            return {
                success: false,
                message: 'User profile not found.',
            };
        }

        return {
            success: true,
            data: userProfile,
        };
    }

    async updateUserProfile(
        user_profile_id: string,
        updateUserProfileDto: UpdateUserProfileDto,
        session: SessionUser,
    ) {
        const userProfile = await this.userProfilesRepository.getUserProfile({
            _id: user_profile_id,
        });

        if (!userProfile) {
            return {
                success: false,
                message: 'User profile not found.',
            };
        }

        const updatedUserProfile = await this.userProfilesRepository.updateUserProfile(
            { _id: user_profile_id },
            { ...updateUserProfileDto },
        );

        if (!updatedUserProfile) {
            return {
                success: false,
                message: 'Failed to update user profile.',
            };
        }

        const userStatusMap = {
            [UserProfileStatus.ACCEPTED]: UserStatus.ACCOUNT_ACTIVE,
            [UserProfileStatus.REJECTED]: UserStatus.KYD_VERIFICATION_PENDING,
        };

        // Update access control status.
        await this.userProfilesRepository.updateUserStatus(
            { _id: userProfile.user_id, account_id: userProfile.account_id },
            { status: userStatusMap[updateUserProfileDto.status] },
        );

        // if (updatedUserProfile.status === UserProfileStatus.PENDING) {
        //     return {
        //         success: true,
        //         data: userProfile,
        //     };
        // }

        const user = await this.userModel.findById(userProfile.user_id);
        const accountLogo = await this.userProfilesRepository.getAccountLogo({
            _id: session.account_id,
        });

        if (updatedUserProfile.status === UserProfileStatus.ACCEPTED) {
            this.eventEmitter.emit(
                'user.registration_accept',
                new UserRegistrationAcceptEvent({
                    user_code: user.code,
                    name: user.name,
                    email: user.email,
                    logo_url: accountLogo.url,
                }),
            );
        }

        if (updatedUserProfile.status === UserProfileStatus.REJECTED) {
            this.eventEmitter.emit(
                'user.registration_reject',
                new UserRegistrationRejectEvent({
                    name: user.name,
                    email: user.email,
                    remarks: updateUserProfileDto.remarks,
                    logo_url: accountLogo.url,
                }),
            );
        }

        return {
            success: true,
            data: updatedUserProfile,
        };
    }

    deleteUserProfile(_id: string) {
        return 'this.userProfilesRepository.findOneAndDelete({ _id });';
    }

    async getPinCodeDetails(pin_code: string): Promise<ResProps1<PinCodeData>> {
        const resGetPinCodeDetails = await this.pinCodeService.getPinCodeDetails(pin_code);

        if (!resGetPinCodeDetails) {
            return {
                success: false,
                message: 'Invalid pin code.',
            };
        }

        return {
            success: true,
            data: {
                ...resGetPinCodeDetails,
                office: resGetPinCodeDetails.office
                    .replace('B.O', '')
                    .replace('S.O', '')
                    .replace('SO', '')
                    .replace('BO', ''),
            },
        };
    }

    convertToCSV(sessionUser: SessionUser, users): string {
        let rows = [
            'User Name',
            'Email Id',
            'Code',
            'Password',
            'Broker Code',
            'PAN',
            'EUIN',
            'Mobile Number',
            'Lock user',
            'Active',
            'Reset Account',
            'Created by',
            'Created date',
            'Modified by',
            'Modified date',
        ].join(',');

        for (const user of users) {
            rows += '\n';
            rows += [
                user.name, // User Name
                user.email, // Email Id
                user.code, // Code
                user.crypto_password ? this.cryptoService.decrypt(user.crypto_password) : '', // Password
                user.referral_code, // Broker Code
                user.pan_number, // PAN
                user.arn?.euin_number || '', // EUIN
                user.phone_number, // Mobile Number
                'No', // Lock User
                'N', // Active
                'N', // Reset Account
                sessionUser.user_id, // Created by
                format(new Date(user.created_at), 'dd/MM/yyyy'), // Created date
                sessionUser.user_id, // Modified by
                format(new Date(user.updated_at), 'dd/MM/yyyy'), // Modified date
            ].join(',');
        }

        return rows;
    }

    async exportUsers(sessionUser: SessionUser, exportUsersDto: ExportUsersDto) {
        const users = await this.usersRepository.exportUsers(
            sessionUser.account_id,
            exportUsersDto.user_ids,
            [UserStatus.ACCOUNT_ACTIVE],
            [UserRole.SALES, UserRole.ADVISOR],
        );

        const usersData = [];
        for (const user of users) {
            const userProfile = await this.userProfilesRepository.getUserProfile({
                user_id: user.id,
            });

            let userData = { ...user.toJSON() };

            if (userProfile) {
                userData = {
                    ...userData,
                    ...userProfile.toJSON(),
                };
            }

            usersData.push(userData);
        }

        return this.convertToCSV(sessionUser, usersData);
    }
}
