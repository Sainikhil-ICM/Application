import {
    Body,
    Controller,
    Delete,
    Get,
    HttpStatus,
    Param,
    ParseFilePipeBuilder,
    Patch,
    Post,
    Query,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { AuthGuard } from 'src/guards/auth.guard';
import { ResourcesService } from './resources.service';
import { UserSession } from 'src/decorators/user-session.decorator';
import { SessionUser } from 'src/constants/user.const';
import { GetResourcesDto } from './dto/get-resources.dto';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';
import { AnyFilesInterceptor } from '@nestjs/platform-express';
import { MongoIdPipe } from 'src/pipes/mongo-id.pipe';

const MAX_ATTACHMENT_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

@Controller('resources')
@UseGuards(AuthGuard)
export class ResourcesController {
    constructor(private readonly resourcesService: ResourcesService) {}

    @Post()
    @UseInterceptors(AnyFilesInterceptor())
    createResource(
        @UserSession() session: SessionUser,
        @Body() createResourceDto: CreateResourceDto,
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpg|jpeg|png|pdf)$/,
                })
                .addMaxSizeValidator({ maxSize: MAX_ATTACHMENT_FILE_SIZE })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    fileIsRequired: false,
                }),
        )
        files: Express.Multer.File[],
    ) {
        return this.resourcesService.createResource(session, createResourceDto, files);
    }

    @Get()
    getResources(@UserSession() session: SessionUser, @Query() query: GetResourcesDto) {
        return this.resourcesService.getResources(session, query);
    }

    @Get(':resource_id')
    getResource(
        @UserSession() session: SessionUser,
        @Param('resource_id', MongoIdPipe) resource_id: string,
    ) {
        return this.resourcesService.getResource(session, resource_id);
    }

    @Patch(':resource_id')
    @UseInterceptors(AnyFilesInterceptor())
    updateResource(
        @UserSession() session: SessionUser,
        @Body() updateResourceDto: UpdateResourceDto,
        @Param('resource_id', MongoIdPipe) resourceId: string,
        @UploadedFiles(
            new ParseFilePipeBuilder()
                .addFileTypeValidator({
                    fileType: /(jpg|jpeg|png|pdf)$/,
                })
                .addMaxSizeValidator({ maxSize: MAX_ATTACHMENT_FILE_SIZE })
                .build({
                    errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
                    fileIsRequired: false,
                }),
        )
        files: Express.Multer.File[],
    ) {
        return this.resourcesService.updateResource(session, resourceId, updateResourceDto, files);
    }

    @Delete(':resource_id')
    deleteResource(
        @UserSession() session: SessionUser,
        @Param('resource_id', MongoIdPipe) resource_id: string,
    ) {
        return this.resourcesService.deleteResource(session, resource_id);
    }
}
