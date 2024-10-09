import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
    HttpStatus,
    ParseFilePipeBuilder,
    UploadedFiles,
    UseInterceptors,
} from '@nestjs/common';
import { UserProfilesService } from './user-profiles.service';
import { CreateUserProfileDto } from './dto/create-user-profile.dto';
import { UpdateUserProfileDto } from './dto/update-user-profile.dto';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';
import { AuthGuard } from 'src/guards/auth.guard';
import { SessionUser } from 'src/constants/user.const';
import { UserSession } from 'src/decorators/user-session.decorator';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { isMongoId } from 'class-validator';
import { ExportUsersDto } from './dto/export-advisors-data.dto';

const MAX_ATTACHMENT_FILE_SIZE = 10 * 1024 * 1024; // 5

@Controller('user-profiles')
@UseGuards(AuthGuard)
export class UserProfilesController {
    constructor(private readonly userProfilesService: UserProfilesService) {}

    @Post()
    createUserProfile(
        @UserSession() session: SessionUser,
        @Body() createUserProfileDto: CreateUserProfileDto,
    ) {
        return this.userProfilesService.createUserProfile(session, createUserProfileDto);
    }

    @Get()
    getUserProfiles() {
        return this.userProfilesService.getUserProfiles();
    }

    @Post('export')
    async exportUsers(@UserSession() session: SessionUser, @Body() exportUsersDto: ExportUsersDto) {
        return this.userProfilesService.exportUsers(session, exportUsersDto);
    }

    @Get(':user_id')
    getUserProfile(@UserSession() session: SessionUser, @Param('user_id') user_id: string) {
        const userId = isMongoId(user_id) ? user_id : String(session.user_id);
        return this.userProfilesService.getUserProfile(userId);
    }

    @Patch(':user_profile_id')
    updateUserProfile(
        @Param('user_profile_id', MongoIdPipe) user_profile_id: string,
        @Body() updateUserProfileDto: UpdateUserProfileDto,
        @UserSession() session: SessionUser,
    ) {
        return this.userProfilesService.updateUserProfile(
            user_profile_id,
            updateUserProfileDto,
            session,
        );
    }

    @Post('attachment')
    @UseInterceptors(AnyFilesInterceptor())
    async uploadAttachment(
        @UserSession() session: SessionUser,
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpg|jpeg|png|pdf)$/,
                })
                .addMaxSizeValidator({ maxSize: MAX_ATTACHMENT_FILE_SIZE })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                }),
        )
        files: Express.Multer.File[],
    ) {
        return this.userProfilesService.uploadAttachment(session, files);
    }

    @Delete(':id')
    deleteUserProfile(@Param('id', MongoIdPipe) id: string) {
        return this.userProfilesService.deleteUserProfile(id);
    }

    @Get('/pin-codes/:pin_code')
    getPinCodeData(@Param('pin_code') pin_code: string) {
        return this.userProfilesService.getPinCodeDetails(pin_code);
    }
}
