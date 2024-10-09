import { ArrayMinSize, IsArray, IsDefined, IsEnum } from 'class-validator';
import { ObjectId } from 'mongoose';

enum AccessControlStatus {
    ACTIVE = 'ACTIVE',
    REVOKED = 'REVOKED',
}

export class UpdateAccessControlsDto {
    // @IsDefined()
    // @IsEnum(UserRole, { each: true })
    // readonly roles: UserRole[];

    @IsDefined()
    @IsArray()
    @ArrayMinSize(1)
    role_group_ids: ObjectId[];

    @IsEnum(AccessControlStatus)
    readonly status: AccessControlStatus;
}
