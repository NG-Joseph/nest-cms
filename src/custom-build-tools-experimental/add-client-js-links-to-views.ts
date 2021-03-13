/*goal here is to use node custom-build-tools/add-client-js-links-to-views.ts
to add the js and css files generated in respective react web client builds to 
the respective nunjucks views that will incorporate reactToNodeStream()
before invoking nestjs build

As the names of files generated changes with build, I can get them; see https://flaviocopes.com/how-to-get-files-names/

Of course, I will need to copy the files to nestjs static folder using copyfiles (https://www.npmjs.com/package/copyfiles)

*/
import * as path from 'path'
import * as fs from 'fs';

export const add_json = (): void => {

    //const targetFile = `${__dirname}/add-client-js-links-to-views.d.ts`;
    const targetFile = path.resolve('./add-client-js-links-to-views.d.ts');
    console.log(targetFile)

    fs.readFile(targetFile, 'utf8', (err, data) => {
        if (err) {
          console.log(err)
        }else{
            console.log(data.toString());
        }
        
    })

    //appending to a file
    fs.appendFile(targetFile, '\nAdditional content here', 'utf8', (err) =>{
        if (err) {
            console.log(err)
        }
    })

    //getting names of files in a directory. See https://flaviocopes.com/how-to-get-files-names/

    const dir = path.resolve('../../src')
    const files = fs.readdirSync(dir)

    for (const file of files) {
        console.log(file)
    }
    

}
add_json();