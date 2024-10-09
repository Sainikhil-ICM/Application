import { ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { Injectable, PipeTransform } from '@nestjs/common';
import { isMongoId } from 'class-validator';

@Injectable()
export class MongoIdPipe implements PipeTransform {
    transform(value: any, { data }: ArgumentMetadata) {
        if (isMongoId(value)) {
            return value;
        }
        throw new BadRequestException(`${data} must be a Object Id`);
        // ["shop has wrong value undefined, shop should not be null or undefined"]
        // ["shop has wrong value Dasd, shop must be a mongodb id"]
    }
}
