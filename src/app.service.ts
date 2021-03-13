import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Hello World!';
  }

  //for dynamic render. An approach
  /*
  getViewName(): string {
    return 'base.html';
  }
  */

  /* One way is to configure nunjucks for each service that needs it. Using a general one setup in global/render.engine.ts
  getRenderer(): nunjucks.Environment {
    const viewTemplateDirectory = join(__dirname, '..', 'views');
    const renderEngine = nunjucks.configure(viewTemplateDirectory, {
      autoescape: true
    });
    return renderEngine;
  }
  */

}
