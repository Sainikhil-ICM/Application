import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';
import { PinCodeData } from 'src/constants/pin-code.const';
import axios from 'axios';

const PIN_CODE_CSV_FILE_URL = 'https://assets.partner.incredmoney.com/public/pincodes_30052019.csv';

@Injectable()
export default class PinCodeService {
    pincodesDataJson: {
        [key: string]: PinCodeData;
    } = {};

    constructor() {
        axios.get(PIN_CODE_CSV_FILE_URL, { responseType: 'blob' }).then((res) => {
            const pincodesDataRaw = res.data;
            const records = parse(pincodesDataRaw, {
                columns: true,
                skip_empty_lines: true,
            });

            for (const record of records) {
                this.pincodesDataJson[record['Pincode']] = {
                    circle: record['Circle Name'],
                    delivery: record['Delivery'] === 'Delivery',
                    district: record['District'],
                    division: record['Division Name'],
                    office: record['Office Name'],
                    officeType: record['OfficeType'],
                    pincode: record['Pincode'],
                    region: record['Region Name'],
                    state: record['StateName'],
                };
            }
        });
    }

    async getPinCodeDetails(pinCode: string): Promise<PinCodeData> {
        return this.pincodesDataJson[pinCode];
    }
}
