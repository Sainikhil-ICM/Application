import { SetMetadata } from '@nestjs/common';
import { AccessControlList } from 'src/constants/access-control.const';

export const Roles = (...roles: AccessControlList[]) => SetMetadata('roles', roles);
