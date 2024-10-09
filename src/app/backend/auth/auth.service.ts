import { Queue } from 'bull';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { ResProps1 } from 'types';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model, ObjectId } from 'mongoose';
import { ConfigService } from '@nestjs/config';
import { differenceInDays } from 'date-fns';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, NotFoundException } from '@nestjs/common';

import { User, UserDocument } from 'src/models/user.model';
import { Account, AccountDocument } from 'src/models/account.model';
import { RoleGroup, RoleGroupDocument } from 'src/models/role-group.model';

import { InvitationSource } from 'src/constants/access-control.const';
import { AppEnv, birthDateLabelMap } from 'src/constants/app.const';
import { AccountType } from 'src/constants/account.const';
import { SessionUser, UserRole, UserStatus } from 'src/constants/user.const';
import { JobName, QueueName, ResProps } from 'src/constants/constants';

import { CreateUserDto } from './dto/create-user.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyUserDto } from './dto/verify-user.dto';
import { ValidatePanNumberDto } from './dto/validate-pan-number.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { ResendMobileOtpDto } from './dto/resend-mobile-otp.dto';
import { ResendEmailOtpDto } from './dto/resend-email-otp.dto';
import { CreateSessionDto } from './dto/create-session.dto';
import { UpdateUserReqDto } from './dto/update-user.req.dto';
import { InitResetPasswordDto } from './dto/init-reset-password.dto';
import { GetPanDetailsDto } from 'src/services/digio/dto/get-pan-details.dto';

import BondsService from 'src/services/bonds.service';
import Msg91Service from 'src/services/msg91.service';
import UtilityService from 'src/services/utility.service';
import UserLogService from 'src/services/user-log/user-log.service';
import DigioService from 'src/services/digio/digio.service';
import { CryptoService } from 'src/services/crypto.service';

import { AuthRepository } from './auth.repository';
import { ResetPasswordEvent } from './events/reset-password.event';
import { UserEmailOtpTriggerEvent } from '../users/events/user-email-otp.event';
import { roleGroups, RoleGroupTypes } from '../role-groups/role-groups.data';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectModel(Account.name)
        private readonly accountModel: Model<AccountDocument>,
        @InjectModel(RoleGroup.name)
        private readonly roleGroupModel: Model<RoleGroupDocument>,

        @InjectQueue(QueueName.ACCOUNTS_QUEUE)
        private readonly accountsQueue: Queue,

        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly bondsService: BondsService,
        private readonly msg91Service: Msg91Service,
        private readonly eventEmitter: EventEmitter2,
        private readonly utilityService: UtilityService,
        private readonly userLogService: UserLogService,
        private readonly digioService: DigioService,
        private readonly authRepository: AuthRepository,
        private readonly cryptoService: CryptoService,
    ) {}

    appEnv = this.configService.get<string>('APP_ENV');
    isInCredValuePlus = this.appEnv === AppEnv.ICVP;
    arrayIncludes = this.utilityService.arrayIncludes;

    async createSession(
        createSessionDto: CreateSessionDto,
    ): Promise<ResProps1<{ access_token: string; status: UserStatus }>> {
        const user = await this.userModel.findOne({ email: createSessionDto.email });

        if (!user) {
            return {
                success: false,
                message: `User with email ${createSessionDto.email} not found.`,
            };
        }

        if (await bcrypt.compare(createSessionDto.password, user.password_secret)) {
            if (user.status === UserStatus.REGISTRATION_COMPLETED) {
                return {
                    success: false,
                    message: 'Your account is under consideration .',
                };
            }
            const accessToken = await this.generateJWT(user, user.account_id);

            if (user.status === UserStatus.KYD_VERIFICATION_PENDING) {
                return {
                    success: true,
                    message: 'Please Complete your kyd proccess.',
                    data: { access_token: accessToken, status: user.status },
                };
            }
            if (user.status !== UserStatus.ACCOUNT_ACTIVE) {
                return {
                    success: false,
                    message: 'Your login is not active, please contact support.',
                };
            }

            // Seeding role groups for the account.
            const account = await this.accountModel.findOne({ _id: user.account_id });
            this.accountsQueue.add(JobName.SEED_ROLE_GROUPS, account.toJSON());

            return {
                success: true,
                data: { access_token: accessToken, status: user.status },
            };
        }

        return {
            success: false,
            message: 'Password is incorrect, please try again.',
        };
    }

    async createUser(createUserDto: CreateUserDto): Promise<ResProps> {
        const user = await this.authRepository.findUser({
            $or: [
                { email: createUserDto.email },
                { pan_number: createUserDto.pan_number },
                { phone_number: createUserDto.phone_number },
            ],
        });

        if (user) {
            return {
                success: false,
                message: 'User already exists, please try logging in.',
            };
        }

        const resCreateReference = await this.bondsService.createReference({
            ...createUserDto,
            account_code: 'ICMP000',
        });

        console.log('🚀 ~ AuthService ~ createUser ~ resCreateReference:', resCreateReference);

        if (!resCreateReference.success) {
            return {
                success: false,
                message: resCreateReference.message ?? 'Could not create reference code.',
            };
        }

        const emailSecret = await this.sendEmailCode(createUserDto.email);
        const phoneSecret = await this.sendPhoneCode(createUserDto);

        const newUser = new this.userModel();
        newUser.set('email_secret', emailSecret);
        newUser.set('phone_secret', phoneSecret);
        newUser.set('referral_code', resCreateReference.data.code);
        newUser.set('api_token', resCreateReference.jwt);
        newUser.set('pan_number', createUserDto.pan_number);
        newUser.set('birth_date', createUserDto.birth_date);
        newUser.set('name', createUserDto.name);
        newUser.set('email', createUserDto.email);
        newUser.set('phone_number', createUserDto.phone_number);

        newUser.set(
            'role',
            createUserDto.role_group_id
                ? UserRole.ADVISOR // TODO: this needs to be wrt role group type
                : UserRole.ADMIN,
        );

        const resData = createUserDto.role_group_id
            ? await this.updateUserRoleGroup(newUser, createUserDto)
            : await this.updateUserAccount(resCreateReference.jwt);

        // Getting user code with prefix for the user.
        const userCode = await this.getUserCode(resData.account_id);

        newUser.set('code', userCode);
        newUser.set('status', resData.status);
        newUser.set('account_id', resData.account_id);
        newUser.set('access_controls', resData.access_controls);
        newUser.set('role_group_ids', [resData.role_group_id]);
        newUser.set('invitation_source', resData.invitation_source);
        await newUser.save();

        const accessToken = await this.generateJWT(newUser, resData.account_id);

        return {
            success: true,
            data: {
                ...newUser.toJSON(),
                access_token: accessToken,
            },
        };
    }

    async forgotPassword({ email }: ForgotPasswordDto): Promise<any> {
        const user = await this.userModel.findOne({ email });

        if (!user) {
            return {
                success: false,
                message: `Account with email ${email} not found.`,
            };
        }

        const token = crypto.randomBytes(32).toString('hex');
        const secret = await bcrypt.hash(token, 10);

        // Save toker for reset password.
        user.set('password_reset_token_secret', secret);
        await user.save();

        // Triggering events on forgot password.
        this.eventEmitter.emit(
            'user.reset_password', // Event name
            new ResetPasswordEvent({ token, user }),
        );

        return { success: true };
    }

    private generateJWT(user: UserDocument, account_id: ObjectId): Promise<string> {
        console.log(
            '🚀 ~ file: auth.service.ts:56 ~ AuthService ~ generateJWT:',
            JSON.stringify(
                {
                    sub: user.pan_number,
                    user_id: user.id,
                    account_id: account_id,
                },
                null,
                2,
            ),
        );

        // return this.jwtService.signAsync({
        //     sub: 'AAMPO9092J',
        //     user_id: '65deeb38118e0de1e63a74a1',
        //     // Assuming user has one account, switch on-click in-case multiple accounts.
        //     account_id: '65d823d4fa821527d74b9c89',
        // });
        return this.jwtService.signAsync({
            sub: user.pan_number,
            user_id: user.id,
            // Assuming user has one account, switch on-click in-case multiple accounts.
            account_id: account_id,
            role: user.role,
        });
    }

    async getOneTimePassword(): Promise<any> {
        const token = Math.random().toString().substring(4, 8);
        const secret = await bcrypt.hash(token, 10);

        console.log('🚀 ~ Login Token', token, secret);
        return { token, secret };
    }

    async getSessionUser(session: SessionUser): Promise<ResProps> {
        // TODO: Change this to aggregation pipeline
        const user = await this.userModel
            .findOne({ _id: session.user_id, account_id: session.account_id })
            .populate<{ account: AccountDocument }>({ path: 'account', select: '_id name type' });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        const diffDays = differenceInDays(new Date(), user.created_at);

        return {
            success: true,
            data: {
                id: user.id,
                role: user.role,
                name: user.name,
                email: user.email,
                email_verified: user.email_verified,
                phone_number: user.phone_number,
                phone_verified: user.phone_verified,
                is_admin: user.is_admin,
                is_new_user: diffDays < 1,
                account_type: user.account.type,
                account_name: user.account.name,
                account_id: user.account._id,
                access_controls: user.access_controls,
            },
        };
    }

    async getTokenDetails(token: string) {
        const secret = this.configService.get<string>('JWT.SECRET');
        const payload = await this.jwtService.verifyAsync(token, { secret });
        const payloadSubs = [
            'USER_INVITATION',
            'ROLE_GROUP_INVITATION_LINK',
            'REPORTEE_REGISTRATION_LINK',
            'CUSTOMER_INVITATION',
        ];

        if (!payloadSubs.includes(payload.sub)) {
            return {
                success: false,
                message: 'Token not found.',
            };
        }

        // Check if the manager's account is active.
        if (payload.sub === 'REPORTEE_REGISTRATION_LINK') {
            const user = await this.userModel.findOne({
                _id: payload.manager_id,
                status: UserStatus.ACCOUNT_ACTIVE,
            });

            if (!user) {
                return {
                    success: false,
                    message: 'Registration link is expired.',
                };
            }
        }

        return { success: true, data: payload };
    }

    // Getting unique user code with account prefix.
    private async getUserCode(accountId: ObjectId, stepCounter = 0): Promise<string> {
        const code = await this.authRepository.getUserCode(accountId, stepCounter);
        const duplicateUser = await this.userModel.findOne({ code, account_id: accountId });

        if (duplicateUser) {
            console.log('🚀 ~ AuthService ~ getUserCode ~ duplicateUser:', code);
            return await this.getUserCode(accountId, stepCounter + 1);
        }

        return code;
    }

    async initResetPassword(initResetPasswordDto: InitResetPasswordDto): Promise<ResProps> {
        const user = await this.userModel
            .findOne({ _id: initResetPasswordDto.user_id })
            .select('email phone_number phone_code account_id');

        if (!user) {
            return {
                success: false,
                message: 'Unable to reset password, please try again.',
            };
        }

        const emailSecret = await this.sendEmailCode(user.email);
        const phoneSecret = await this.sendPhoneCode(user);

        user.set('email_secret', emailSecret);
        user.set('email_verified', false);
        user.set('phone_secret', phoneSecret);
        user.set('phone_verified', false);
        await user.save();

        const accessToken = await this.generateJWT(user, user.account_id);

        return {
            success: true,
            data: { access_token: accessToken },
        };
    }

    async sendEmailCode(email: string): Promise<string> {
        const { token, secret } = await this.getOneTimePassword();

        this.eventEmitter.emit(
            'user.email_otp_trigger',
            new UserEmailOtpTriggerEvent({
                token,
                email,
            }),
        );

        return secret;
    }

    async sendPhoneCode(params: { phone_code: string; phone_number: string }): Promise<string> {
        const { phone_code, phone_number } = params;
        const { token, secret } = await this.getOneTimePassword();

        await this.msg91Service
            .sendMessage(`${phone_code}${phone_number}`, token)
            .catch((error) => {
                debugger;
                // TODO - Send notification to dev team
                console.log('🚀 ~ file: auth.service.ts:66 ~ AuthService ~ .then ~ err:', error);
            });

        return secret;
    }

    async resendEmailOTP({ email }: ResendEmailOtpDto): Promise<ResProps> {
        const user = await this.userModel.findOne({ email });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        const emailSecret = await this.sendEmailCode(user.email);

        user.set('email_secret', emailSecret);
        await user.save();

        return {
            success: true,
            message: 'OTP resend successful',
        };
    }

    async resendMobileOTP(body: ResendMobileOtpDto): Promise<ResProps> {
        const { phone_number } = body;
        const user = await this.userModel.findOne({ phone_number: phone_number }).exec();
        if (user) {
            const phoneSecret = await this.sendPhoneCode(user);
            user.phone_secret = phoneSecret;
            await user.save();
            return {
                success: true,
                message: 'OTP resend successful',
            };
        } else {
            throw new NotFoundException('User not found.');
        }
    }

    async resetPassword(params: ResetPasswordDto): Promise<ResProps> {
        const { token, user_id, password } = params;
        const user = await this.userModel.findOne({ _id: user_id });

        if (!user) {
            return {
                success: false,
                message: 'Unable to reset password, please try again.',
            };
        }
        debugger;

        if (await bcrypt.compare(token, user.password_reset_token_secret)) {
            const accessToken = await this.generateJWT(user, user.account_id);

            if (user.status === UserStatus.BASIC_DETAILS_ENTERED) {
                user.set(
                    'status',
                    user.role === UserRole.ADVISOR
                        ? UserStatus.KYD_VERIFICATION_PENDING
                        : UserStatus.ACCOUNT_ACTIVE,
                );
            }

            // Updating password secret for user.
            const secret = await bcrypt.hash(password, 10);
            const crypto_password = this.cryptoService.encrypt(password);
            user.set('password_secret', secret);
            user.set('password_reset_token_secret', secret);
            user.set('crypto_password', crypto_password);

            const data = await user.save();

            return {
                success: true,
                data: {
                    ...data.toJSON(),
                    access_token: accessToken,
                    status: user.status,
                },
            };
        }

        return {
            success: false,
            message: 'Invalid or expired password reset token.',
        };
    }

    async updatePassword(session: SessionUser, params: UpdatePasswordDto): Promise<ResProps> {
        const user = await this.userModel.findOne({
            _id: session.user_id,
            account_id: session.account_id,
        });

        if (!user) {
            return {
                success: false,
                message: 'User not found, please contact support.',
            };
        }

        // Updating status for access controls.
        // accessControl.set('status', AccessControlStatus.REGISTRATION_COMPLETED);

        // Mark KYD verification pending in-case of advisor(IFA).
        // Advisor needs to complete the KYD(onboarding) for admin to approve.
        if (user.role === UserRole.ADVISOR) {
            user.set('status', UserStatus.KYD_VERIFICATION_PENDING);
        } else {
            user.set('status', UserStatus.ACCOUNT_ACTIVE);
        }

        await user.save();

        // Updating password secret for user
        const secret = await bcrypt.hash(params.password, 10);
        const crypto_password = this.cryptoService.encrypt(params.password);

        user.set('password_secret', secret);
        user.set('crypto_password', crypto_password);

        await user.save();

        // Sending welcome email
        if (user.status !== UserStatus.KYD_VERIFICATION_PENDING) {
            this.eventEmitter.emit('user.registration_successful', user);
        }

        // this.eventEmitter.emit('user.create', new UserCreateEvent(user.toJSON()));

        return {
            success: true,
            data: { status: user.status },
        };
    }

    async updateUser(user_id: string, body: UpdateUserReqDto): Promise<ResProps> {
        const user = await this.userModel
            .findOne({ _id: user_id })
            .populate<{ account: AccountDocument }>('account');

        if (!user) {
            return {
                success: false,
                message: 'User invitation has expired.',
            };
        }

        const resCreateReference = await this.bondsService.createReference({
            ...body,
            email: user.email,
            account_code: user.account.code,
        });

        console.log('🚀 ~ AuthService ~ updateUser ~ resCreateReference:', resCreateReference);

        if (!resCreateReference.success) {
            return {
                success: false,
                message: resCreateReference.message ?? 'Could not create reference code.',
            };
        }

        const emailSecret = await this.sendEmailCode(user.email);
        const phoneSecret = await this.sendPhoneCode(body);

        user.set('referral_code', resCreateReference.data.code);
        user.set('phone_secret', phoneSecret);
        user.set('email_secret', emailSecret);
        user.set('api_token', resCreateReference.jwt);
        user.set('name', body.name);
        user.set('phone_number', body.phone_number);
        user.set('status', UserStatus.BASIC_DETAILS_ENTERED);
        await user.save();

        const accessToken = await this.generateJWT(user, user.account.id);
        // this.eventEmitter.emit('user.update', new UserUpdateEvent(user.toJSON()));

        return {
            success: true,
            data: { ...user.toJSON(), access_token: accessToken },
        };
    }

    private async updateUserAccount(user_api_token: string): Promise<{
        role_group_id: ObjectId;
        account_id: ObjectId;
        access_controls: string[];
        status: UserStatus;
        invitation_source: InvitationSource;
    }> {
        const account = new this.accountModel();
        account.set('name', '');
        account.set('type', AccountType.INDIVIDUAL);
        account.set('user_api_token', user_api_token);
        account.set('api_token', crypto.randomBytes(32).toString('hex'));
        await account.save();
        debugger;

        const roleGroup = await this.roleGroupModel.create({
            ...roleGroups[RoleGroupTypes._ACCOUNT_ADMIN],
            account_id: account.id,
        });

        // Seeding role groups for the account.
        // this.eventEmitter.emit('account.create', new AccountCreateEvent(account.toJSON()));
        this.accountsQueue.add(JobName.SEED_ROLE_GROUPS, account.toJSON());

        debugger;
        return {
            role_group_id: roleGroup.id,
            account_id: account.id,
            status: UserStatus.BASIC_DETAILS_ENTERED,
            invitation_source: InvitationSource.WEBSITE,
            access_controls: [roleGroup.type, ...roleGroup.roles],
        };
    }

    private async updateUserRoleGroup(
        user: UserDocument,
        createUserDto: CreateUserDto,
    ): Promise<{
        role_group_id: ObjectId;
        account_id: ObjectId;
        access_controls: string[];
        status: UserStatus;
        invitation_source: InvitationSource;
    }> {
        const roleGroup = await this.roleGroupModel.findOne({ _id: createUserDto.role_group_id });

        if (!roleGroup) {
            throw new NotFoundException('Invitation url is invalid, please contact support.');
        }

        if (createUserDto.manager_id) {
            const userLinkParams = {};
            userLinkParams['account_id'] = roleGroup.account_id;
            userLinkParams['reportee_id'] = user.id;
            userLinkParams['manager_id'] = createUserDto.manager_id;
            debugger;
            await this.authRepository.addLinkToManager(userLinkParams);
        }

        return {
            role_group_id: roleGroup.id,
            account_id: roleGroup.account_id,
            access_controls: [roleGroup.type, ...roleGroup.roles],
            status: UserStatus.BASIC_DETAILS_ENTERED,
            invitation_source: InvitationSource.ROLE_GROUP_URL,
        };
    }

    async validatePanNumber(validatePanNumberDto: ValidatePanNumberDto) {
        const panType = this.utilityService.getPanType(validatePanNumberDto.pan_number);

        const getPanQuery = new GetPanDetailsDto(validatePanNumberDto);
        const resGetPanDetails = await this.digioService.getPanDetails(getPanQuery);

        console.log('🚀 ~ AuthService ~ validatePanNumber ~ resGetPanDetails:', resGetPanDetails);

        if (!resGetPanDetails) {
            return {
                success: false,
                message: 'Requested PAN details not found.',
            };
        }

        if (resGetPanDetails.status == 'invalid') {
            return {
                success: false,
                message: `Invalid PAN (${resGetPanDetails.pan})`,
            };
        }

        if (!resGetPanDetails.name_as_per_pan_match) {
            return {
                success: false,
                message: `Full Name (${validatePanNumberDto.name}) does not match with PAN.`,
            };
        }

        if (!resGetPanDetails.date_of_birth_match) {
            return {
                success: false,
                message: `${birthDateLabelMap(panType)} (${
                    validatePanNumberDto.birth_date
                }) does not match with PAN.`,
            };
        }

        return {
            success: true,
            data: resGetPanDetails,
        };
    }

    async verifyUser(params: VerifyUserDto): Promise<ResProps> {
        const { email_otp, phone_otp, user_id } = params;
        const user = await this.userModel.findOne({ _id: user_id });

        if (!user) {
            return {
                success: false,
                message: 'User not found.',
            };
        }

        if (
            (await bcrypt.compare(email_otp, user.email_secret)) &&
            (await bcrypt.compare(phone_otp, user.phone_secret))
        ) {
            user.email_verified = true;
            user.phone_verified = true;
            await user.save();

            const accessToken = await this.generateJWT(user, user.account_id);

            return {
                success: true,
                data: { access_token: accessToken },
            };
        } else {
            return {
                success: false,
                message: 'OTP did not match, please enter the valid OTPs.',
            };
        }
    }
}
