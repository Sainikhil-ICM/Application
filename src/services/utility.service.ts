import { Injectable } from '@nestjs/common';
import * as snakeCase from 'lodash/snakeCase';
import * as difference from 'lodash/difference';
import * as intersection from 'lodash/intersection';
import { PanType } from 'src/constants/app.const';
import * as startCase from 'lodash/startCase';
import axios from 'axios';

interface KebabCaseOptions {
    caseType?: 'lower' | 'upper';
}

@Injectable()
export default class UtilityService {
    /**
     * This method creates an object without given props.
     * @param obj
     * @param props
     * @returns {Object}
     */
    omit(obj: any, props: string[]) {
        const dupObject = { ...obj };
        props.forEach((prop) => delete dupObject[prop]);
        return dupObject;
    }

    /**
     * This method creates an object with given props.
     * @param obj
     * @param props
     * @returns {Object}
     */
    pick(obj: any, props: string[], options?: { snakeKeys: boolean }) {
        options = { snakeKeys: false, ...options };
        const tempObject = {};
        props.forEach((prop) => {
            if (options.snakeKeys) {
                return (tempObject[snakeCase(prop)] = obj[prop]);
            } else {
                return (tempObject[prop] = obj[prop]);
            }
        });
        return tempObject;
    }

    /**
     * This method splits phone number into phone code and phone number.
     * @param obj
     * @param props
     * @returns {Object}
     */
    splitPhoneNumber(phone_number: string) {
        return {
            code: phone_number.substring(0, phone_number.length - 10),
            number: phone_number.substring(phone_number.length - 10),
        };
    }

    /**
     * This method calculates the days invested for transactions.
     * @param transaction
     * @returns number
     */
    calculateDaysInvested(transaction: any) {
        const { created_at } = transaction;
        const daysInvested = Math.ceil(
            (+new Date() - +new Date(created_at)) / (1000 * 60 * 60 * 24),
        );
        return daysInvested;
    }

    /**
     * This method calculates the product tenure for transactions.
     * @param transaction
     * @param productData
     * @returns number
     */
    calculateDaysProductTenure(transaction: any, productData: any[]) {
        const { product_code } = transaction;

        const productDetails = productData.find((product) => product.product === product_code);

        const start = new Date(String(productDetails?.issueDate));
        const end = new Date(String(productDetails?.maturityDate));

        const timeDifference = +end - +start;

        const daysDifference = Math.ceil(timeDifference / (1000 * 60 * 60 * 24));

        return daysDifference;
    }

    /**
     * This method calculates the commission for transactions.
     * @param transaction
     * @param productData
     * @param return_rate
     * @returns number
     */
    calculateTrailCommission(transaction: any, productData: any[], return_rate: number) {
        const { user_amount, units } = transaction;

        const productTenure = this.calculateDaysProductTenure(transaction, productData);
        const daysInvested = this.calculateDaysInvested(transaction);

        const commission =
            (daysInvested * parseFloat(user_amount) * units * return_rate) / productTenure;

        return {
            commission: parseFloat(String(commission)).toFixed(2),
            productTenure,
            daysInvested,
        };
    }

    /**
     * This method calculates the commission for transactions.
     * @param transaction
     * @param productData
     * @param return_rate
     * @returns number
     */
    calculateDirectCommission(transaction: any, productData: any[], return_rate: number) {
        const { user_amount } = transaction;

        const productTenure = this.calculateDaysProductTenure(transaction, productData);
        const daysInvested = this.calculateDaysInvested(transaction);

        const commission = parseFloat(user_amount) * (return_rate / 100);

        return {
            commission: parseFloat(String(commission)).toFixed(2),
            productTenure,
            daysInvested,
        };
    }

    // This function checks if all/some elements of the first array are included in the second array
    arrayIncludes<T>(arr1: T[], arr2: T[], options?: { every: boolean }): boolean {
        // return options?.every ? difference(arr1, arr2) : intersection(arr1, arr2);
        return options?.every
            ? difference(arr1, arr2).length === 0
            : intersection(arr1, arr2).length > 0;
    }

    toKebabCase(str: string, options: KebabCaseOptions = { caseType: 'lower' }): string {
        const result = str
            .replace(/([a-z])([A-Z])/g, '$1_$2') // Convert camelCase
            .replace(/\s+/g, '_'); // Convert spaces

        return options.caseType === 'upper' ? result.toUpperCase() : result.toLowerCase();
    }

    /**
     * Returns the type of PAN based on the provided PAN number.
     * @param pan_number - The PAN number to determine the type for.
     * @returns The type of PAN.
     */
    getPanType(pan_number: string): PanType {
        const fourthChar = pan_number.charAt(3).toUpperCase();
        switch (fourthChar) {
            case 'P':
                return PanType.INDIVIDUAL;
            case 'F':
                return PanType.FIRM;
            case 'C':
                return PanType.COMPANY;
            case 'H':
                return PanType.HINDU_UNDIVIDED_FAMILY;
            case 'A':
                return PanType.ASSOCIATION_OF_PERSONS;
            case 'B':
                return PanType.BODY_OF_INDIVIDUALS;
            case 'G':
                return PanType.GOVERNMENT;
            case 'J':
                return PanType.ARTIFICIAL_JURIDICAL_PERSON;
            case 'L':
                return PanType.LOCAL_AUTHORITY;
            case 'T':
                return PanType.TRUST;
            default:
                return PanType.UNKNOWN;
        }
    }

    /**
     * Titleizes the input string and returns it. (Sample Titelized String)
     *
     * @param input - input string to be titleized
     * @returns titleized string
     */
    titleize(input?: string) {
        return input ? startCase(input.toLowerCase()) : input;
    }

    /**
     * Converts an image URL to base64
     */
    async imageUrlToBase64(url: string): Promise<string> {
        const response = await axios.get(url, {
            responseType: 'arraybuffer',
        });
        const buffer = Buffer.from(response.data, 'binary');
        const base64String = buffer.toString('base64');
        return base64String;
    }

    splitName(name: string) {
        const nameSplit = name.split(' ');
        return {
            first: nameSplit[0],
            middle: nameSplit.slice(1, -1).join(' '),
            last: nameSplit.length > 1 ? nameSplit.at(-1) : '',
        };
    }
}
