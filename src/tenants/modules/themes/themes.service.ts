import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateThemeDto } from './dto/create/create-theme.dto';
import { Theme } from './models/theme.entity';

@Injectable()
export class ThemesService {

    constructor(
        @InjectRepository(Theme) private themeRepository: Repository<Theme>,
    ){}

    async create (createThemeDto: CreateThemeDto): Promise<Theme>{

        const newTheme = this.themeRepository.create(createThemeDto);
        return this.themeRepository.save(newTheme);
        
    }
}
