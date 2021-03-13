import * as nunjucks from 'nunjucks';
import { join } from 'path';


const renderEngine = ():nunjucks.Environment => {
    const viewTemplateDirectory = join(__dirname, '../../', 'views');
    const renderEngine = nunjucks.configure(viewTemplateDirectory, {
      autoescape: true,
      watch: false // (default: false) reload templates when they are changed (server-side). To use watch, make sure optional dependency chokidar is installed.
      //see https://mozilla.github.io/nunjucks/api.html#configure for more options.
    });
    return renderEngine;
}
export default renderEngine;