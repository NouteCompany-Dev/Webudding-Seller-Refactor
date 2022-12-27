import { Module } from '@nestjs/common';
import { FilesService } from './Files.service';
import { FilesController } from './Files.controller';

@Module({
    providers: [FilesService],
    controllers: [FilesController],
})
export class FilesModule {}
