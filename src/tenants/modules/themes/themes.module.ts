import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Theme } from './models/theme.entity';
import { ThemesController } from './themes.controller';
import { ThemesService } from './themes.service';

@Module({
    imports: [TypeOrmModule.forFeature([Theme])],
    controllers: [ThemesController],
    providers: [ThemesService]
})

export class ThemesModule {}
