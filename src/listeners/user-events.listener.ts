import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UserCreateEvent } from 'src/app/backend/users/events/user-create.event';
import { UserEmailOtpTriggerEvent } from 'src/app/backend/users/events/user-email-otp.event';
import { UserRegistrationAcceptEvent } from 'src/app/backend/users/events/user-registration-accept.event';
import { UserRegistrationRejectEvent } from 'src/app/backend/users/events/user-registration-reject-event';
import { UserRegistrationEvent } from 'src/app/backend/users/events/user-registration.event';
import { UserUpdateEvent } from 'src/app/backend/users/events/user-update.event';
import { User, UserDocument } from 'src/models/user.model';
import MailerService from 'src/services/mailer.service';
import { CreateVendorDto } from 'src/services/zoho/dto/create-vendor.dto';
import { UpdateVendorDto } from 'src/services/zoho/dto/update-vendor.dto';
import ZohoService from 'src/services/zoho/zoho.service';
import { AppEnv } from 'src/constants/app.const';
import { UserRole } from 'src/constants/user.const';
import { JwtService } from '@nestjs/jwt';
import { ResetPasswordEvent } from 'src/app/backend/auth/events/reset-password.event';

@Injectable()
export class UserEventsListener {
    constructor(
        @InjectModel(User.name)
        private userModel: Model<UserDocument>,
        private zohoService: ZohoService,
        private readonly mailerService: MailerService,
        private readonly configService: ConfigService,
        private jwtService: JwtService,
    ) {}

    clientURL = this.configService.get<string>('CLIENT_URL');
    appEnv = this.configService.get<string>('APP_ENV');
    isInCredValuePlus = this.appEnv === AppEnv.ICVP;

    @OnEvent('user.create')
    async handleUserCreate(params: UserCreateEvent) {
        const resCreateRecord = await this.zohoService.createRecord({
            recordType: 'Vendors',
            data: new CreateVendorDto(params),
        });

        console.log(
            '🚀 ~ UserEventsListener ~ handleUserCreate ~ resCreateRecord:',
            resCreateRecord,
        );

        if (resCreateRecord) {
            const zohoRecordId = resCreateRecord[0].details.id;

            // Add the Zoho Record ID to the User document
            await this.userModel.findOneAndUpdate({ _id: params.id }, { zoho_id: zohoRecordId });
        }
    }

    @OnEvent('user.update')
    async handleUserUpdate(params: UserUpdateEvent) {
        const resUpdateRecord = await this.zohoService.updateRecord({
            recordType: 'Vendors',
            data: new UpdateVendorDto(params),
        });

        console.log(
            '🚀 ~ UserEventsListener ~ handleUserUpdate ~ resUpdateRecord:',
            resUpdateRecord,
        );
    }

    @OnEvent('user.registration')
    async handleAccountRegister(params: UserRegistrationEvent) {
        console.log('🚀 ~ UserEventsListener ~ handleAccountRegister ~ params:', params);

        await this.mailerService.sendTemplateEmail({
            template_name: 'advisor-registration-complete.hbs',
            template_params: {
                name: params.name,
                logoUrl: params.logo_url.replace('.svg', '.png'),
            },
            subject: 'InCred Value Plus | Empanelment Request',
            to_emails: [params.email],
        });
    }

    @OnEvent('user.registration_accept')
    async handleRegisterAccept(params: UserRegistrationAcceptEvent) {
        console.log('🚀 ~ UserEventsListener ~ handleRegisterAccept ~ params:', params);

        const clientURL = this.configService.get<string>('CLIENT_URL');
        await this.mailerService.sendTemplateEmail({
            template_name: 'accept-kyd.hbs',
            template_params: {
                user_code: params.user_code,
                name: params.name,
                action_url: clientURL,
                logo_url: params.logo_url.replace('.svg', '.png'),
            },
            subject:
                'InCred Value Plus | Confirmation of Successful Registration and Login Credentials',
            to_emails: [params.email],
        });
    }

    @OnEvent('user.registration_reject')
    async handleRegisterReject(params: UserRegistrationRejectEvent) {
        console.log('🚀 ~ UserEventsListener ~ handleRegisterReject ~ params:', params);

        const clientURL = this.configService.get<string>('CLIENT_URL');
        const resetLink = `${clientURL}/auth/login`;

        await this.mailerService.sendTemplateEmail({
            template_name: 'reject-kyd.hbs',
            template_params: {
                name: params.name,
                remarks: params.remarks.split('\n'),
                logo_url: params.logo_url.replace('.svg', '.png'),
                reset_link: resetLink,
            },
            subject: 'InCred Value Plus | Update on Empanelment !!',
            to_emails: [params.email],
        });
    }

    @OnEvent('user.registration_successful')
    async handlePasswordUpdate(user: UserDocument) {
        const clientURL = this.configService.get<string>('CLIENT_URL');

        await this.mailerService.sendTemplateEmail({
            template_name: 'welcome.hbs',
            template_params: {
                user_code: user.code,
                name: user.name,
                action_url: clientURL,
                designation: user.role === UserRole.ADVISOR ? 'Advisor' : 'Relationship Manager',
                onboarding_target: user.role === UserRole.ADVISOR ? 'Customers' : 'Advisors',
            },
            subject:
                (this.isInCredValuePlus ? 'InCred ValuePlus' : 'InCred Money') +
                ' | Welcome Aboard!!',
            to_emails: [user.email],
        });
    }

    @OnEvent('user.email_otp_trigger')
    async handleEmailOtpTrigger(params: UserEmailOtpTriggerEvent) {
        await this.mailerService.sendTemplateEmail({
            template_name: 'onetime-password.hbs',
            template_params: { token: params.token },
            subject:
                (this.isInCredValuePlus ? 'InCred ValuePlus' : 'InCred Money') +
                ' | OTP for email verification',
            to_emails: [params.email],
        });
    }

    @OnEvent('user.send_invitation_email')
    async handleSendInvitationEmail(user: UserDocument) {
        const inviteToken = await this.jwtService.signAsync({
            sub: 'USER_INVITATION',
            id: user.id,
            name: user.name,
            email: user.email,
        });

        const clientURL = this.configService.get<string>('CLIENT_URL');
        const invitationLink = `${clientURL}/auth/register?token=${inviteToken}`;

        const userDesignationGreetingMap = {
            [UserRole.SALES]: 'Dear Relationship Manager,',
            [UserRole.ADVISOR]: 'Dear Advisor,',
            [UserRole.ADMIN]: 'Dear Admin,',
        };
        console.log(
            '🚀 ~ UserEventsListener ~ handleSendInvitationEmail ~ invitationLink:',
            invitationLink,
            {
                template_name: 'advisor-invitation.hbs',
                template_params: {
                    name: user.name,
                    action_url: invitationLink,
                    designation_greeting: userDesignationGreetingMap[user.role],
                },
                subject:
                    (this.isInCredValuePlus ? 'InCred ValuePlus' : 'InCred Money') +
                    ' | Welcome Aboard!!',
                to_emails: [user.email],
            },
        );

        await this.mailerService.sendTemplateEmail({
            template_name: 'advisor-invitation.hbs',
            template_params: {
                name: user.name,
                action_url: invitationLink,
                designation_greeting: userDesignationGreetingMap[user.role],
            },
            subject:
                (this.isInCredValuePlus ? 'InCred ValuePlus' : 'InCred Money') +
                ' | Welcome Aboard!!',
            to_emails: [user.email],
        });
    }

    @OnEvent('user.reset_password')
    async handleResetPasswordEmail(params: ResetPasswordEvent) {
        const resetLink = [
            `${this.clientURL}/auth/reset-password`,
            `token=${params.token}&uid=${params.user.id}`,
        ].join('?');

        return this.mailerService.sendTemplateEmail({
            template_name: 'reset-password.hbs',
            template_params: { name: params.user.name, resetLink },
            subject: 'Your password reset token (valid for 10 minutes)',
            to_emails: [params.user.email],
        });
    }
}
