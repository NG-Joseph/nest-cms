import { Controller, Get, Res } from '@nestjs/common';
import { AppService } from './app.service';
import { API_VERSION } from './global/app.settings';
//import { renderToNodeStream } from 'react-dom/server';
//import * as React from 'react';

//Below is Josephmodification to include fastify point-of-view view which is the equivalent of eclipse render
import { Reply } from './global/custom.interfaces';
//import App from './clients_dev/tenant-react-web-client/src/App';

import renderEngine from './global/render.engine';

//import App from './clients/tenant-react-web-client/src/App';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /* Below is a static way of rendering
  @Get()
  @Render('base.html')
  //getHello(): string {
  home(){
    //render main app guest home here. Use inheritance to separate header from navigation from content from footer
    //the content area will be supplied by react on an SPA basis
    //return this.appService.getHello();
    return {greeting: 'Hello World from MVC'}

  }
  */
 /**
  * Handler for root URL. Renders home.html
  * @param reply FastifyReply
  */
  @Get()
  home(@Res() reply: Reply){
    //render main app guest home here. Use inheritance to separate header from navigation from content from footer
    //If home page is expected to be interactive, the content area can better be supplied by react on an SPA basis
    reply.view('guest-website/home.html', {apiVersion: API_VERSION!==null? `${API_VERSION}`: '', title: 'SGVI-1 Mini CMS Home', homeActive: 'true', currentUrlSlug: API_VERSION!==null?`/${API_VERSION}`: '/'})

    //return this.appService.getHello();
    
  }  
  
}
