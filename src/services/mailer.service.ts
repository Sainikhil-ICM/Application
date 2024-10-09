import * as fs from 'fs';
import { join } from 'path';
import hbs from 'handlebars';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { BrandName } from 'src/constants/mailer.const';
import { SESClient, SendRawEmailCommand } from '@aws-sdk/client-ses';
import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { PartnerNameMap } from 'src/constants/app.const';

// Docs
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-ses/index.html
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/ses-examples.html
// https://github.com/awsdocs/aws-doc-sdk-examples/tree/main/javascriptv3/example_code/ses

@Injectable()
export default class MailerService {
    constructor(private readonly configService: ConfigService) {}

    supportEmail = this.configService.get<string>('EMAIL.SUPPORT');
    partnerId = this.configService.get<string>('PARTNER_NAME');

    accessKeys = {
        [BrandName.PARTNER]: {
            accessKeyId: this.configService.get<string>('AWS.PARTNER_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>('AWS.PARTNER_SECRET_ACCESS_KEY'),
            fromEmail: this.configService.get<string>('AWS.PARTNER_SES_FROM_EMAIL'),
            sesRegion: this.configService.get<string>('AWS.PARTNER_SES_REGION'),
        },
        [BrandName.BIDD]: {
            accessKeyId: this.configService.get<string>('AWS.BIDD_ACCESS_KEY_ID'),
            secretAccessKey: this.configService.get<string>('AWS.BIDD_SECRET_ACCESS_KEY'),
            fromEmail: this.configService.get<string>('AWS.BIDD_SES_FROM_EMAIL'),
            sesRegion: this.configService.get<string>('AWS.BIDD_SES_REGION'),
        },
    };

    private getTransporter({
        accessKeyId,
        secretAccessKey,
        sesRegion,
    }: {
        accessKeyId: string;
        secretAccessKey: string;
        sesRegion: string;
    }) {
        return nodemailer.createTransport({
            SES: {
                // Create SES service object.
                ses: new SESClient({
                    apiVersion: '2010-12-01',
                    region: sesRegion,
                    credentials: {
                        accessKeyId,
                        secretAccessKey,
                    },
                }),
                aws: { SendRawEmailCommand },
            },
        });
    }

    private getPartnerName(brand_name: BrandName): string {
        return brand_name === BrandName.PARTNER
            ? // Keeping code in multiple lines for better readability.
              PartnerNameMap[this.partnerId]
            : 'Bidd';
    }

    async getTemplate(templateName: string): Promise<string> {
        return new Promise((resolve, reject) => {
            const templatePath = join(__dirname, '..', 'mailers', templateName);
            fs.readFile(templatePath, (err, buffer) => {
                if (err) reject(err);
                resolve(buffer.toString());
            });
        });
    }

    async sendTemplateEmail({
        brand_name = BrandName.PARTNER,
        template_name,
        template_params,
        subject,
        to_emails,
        attachments,
    }: {
        brand_name?: BrandName;
        template_name: string;
        template_params: any;
        subject: string;
        to_emails: string[];
        attachments?: { filename: string; content: Buffer; contentType: string }[];
    }) {
        try {
            const mailerConfig = this.accessKeys[brand_name];
            const template = await this.getTemplate(template_name);

            const brandFolder = brand_name === BrandName.PARTNER ? this.partnerId : brand_name;
            const header = await this.getTemplate(`partials/${brandFolder}/header.hbs`);
            const footer = await this.getTemplate(`partials/${brandFolder}/footer.hbs`);
            const disclaimer = await this.getTemplate(`partials/${brandFolder}/disclaimer.hbs`);
            const support = await this.getTemplate(`partials/${brandFolder}/support.hbs`);

            return (
                this
                    // Keeping code in multiple lines.
                    .getTransporter(mailerConfig)
                    .sendMail({
                        from: mailerConfig.fromEmail,
                        to: to_emails,
                        subject: subject,
                        html: hbs.compile(template)(
                            {
                                ...template_params,
                                is_partner_money: this.partnerId === 'incredmoney',
                                partner_name: this.getPartnerName(brand_name),
                                support_email: this.supportEmail,
                            },
                            {
                                partials: {
                                    header: hbs.compile(header),
                                    footer: hbs.compile(footer),
                                    disclaimer: hbs.compile(disclaimer),
                                    support: hbs.compile(support),
                                },
                            },
                        ),
                        attachments,
                    })
            );
        } catch (error) {
            console.log('🚀 ~ MailerService ~ sendEmailTemplate ~ error:', error);
            throw new ServiceUnavailableException('Could not emails at the moment.');
        }
    }
}
