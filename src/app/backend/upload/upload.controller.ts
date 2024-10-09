import {
    Controller,
    Get,
    NotFoundException,
    Param,
    Post,
    UploadedFile,
    UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import * as fs from 'fs';

@Controller('files')
export class UploadController {
    private uploadsDirectory = __dirname.split('/').slice(0, -1).join('/') + '/public/uploads/';
    @Post('upload/:username/:type')
    @UseInterceptors(
        FileInterceptor('file', {
            dest: __dirname.split('/').slice(0, -1).join('/') + '/public/uploads/', // Define your upload directory
        }),
    )
    async uploadFile(
        @UploadedFile() file: Express.Multer.File,
        @Param('username') username: string,
        @Param('type') type: string,
    ): Promise<string> {
        const userDirectory = path.join(this.uploadsDirectory, username, type);
        if (!fs.existsSync(userDirectory)) {
            fs.mkdirSync(userDirectory, { recursive: true });
        }
        const filePath = path.join(userDirectory, file.originalname);
        console.log(filePath);
        fs.renameSync(file.path, filePath);

        return 'File uploaded successfully.';
    }

    @Get('fetch/:username')
    async fetchUserFiles(@Param('username') username: string): Promise<{ files: string[] }> {
        const userDirectory = path.join(this.uploadsDirectory, username);

        if (!fs.existsSync(userDirectory)) {
            throw new NotFoundException('No files found for the user.');
        }

        const files = fs.readdirSync(userDirectory);

        const final = [];
        files.map((item) => {
            const temp = path.join(userDirectory, item);
            const fileName = fs.readdirSync(temp);

            final.push({ type: item, fileName: `${temp}/${fileName[0]}` });
        });

        // Return the list of filenames associated with the user's directory
        return { files: final };
    }

    @Get('download/:username/:filename')
    async downloadFile(
        @Param('username') username: string,
        @Param('filename') filename: string,
    ): Promise<string> {
        const userDirectory = path.join(this.uploadsDirectory, username);
        const filePath = path.join(userDirectory, filename);

        if (fs.existsSync(filePath)) {
            // You might want to return the file path or some success message here
            return 'File download initiated.';
        } else {
            throw new NotFoundException('File not found.');
        }
    }
}
