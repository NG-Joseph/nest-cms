import { Body, Controller, Get, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreateThemeDto } from './dto/create/create-theme.dto';
import { Theme } from './models/theme.entity';
import { ThemesService } from './themes.service';

@ApiTags('tenants/themes')
@Controller('tenants/themes')
export class ThemesController {

    constructor(private readonly themesService: ThemesService) { }

    @Post()
    create(@Body() createThemeDto: CreateThemeDto): Promise<Theme> {
        //console.log(JSON.stringify(createThemeDto));
        return this.themesService.create(createThemeDto);
    }

    @Get()
    findAll(): string {
        return "This is tenant theme"
    }

}
