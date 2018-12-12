var timerStart = Date.now();

const fs = require('fs-extra');
const env = require('dotenv');
const mime = require('mime-types');
const mkdirp = require('mkdirp');

const postcss = require('postcss');
const autoprefixer = require('autoprefixer');
const cleanCSS = require('postcss-clean');

env.config();
const publicDirectoryName = process.env.PUBLIC_DIR_NAME || 'public';
const sourceDirectoryName = process.env.SOURCE_DIR_NAME || 'src';
const contentDirectoryName = process.env.CONTENT_DIR_NAME || 'content';
const contentDirectoryPath = sourceDirectoryName + "/" + contentDirectoryName;

function readDirRecursive(inDirectory, outDirectory){
    fs.readdir(inDirectory, (err, filesOrDirectories) => {
        filesOrDirectories.forEach(name => {
            if(fs.lstatSync(inDirectory + name).isDirectory()){
                readDirRecursive(inDirectory + name + "/", outDirectory + name + "/");
            }
            else{
                if (mime.lookup(name) === "text/css") {
                    var source = fs.readFileSync(inDirectory + name, 'utf8');
                    postcss([
                    	autoprefixer({
                    		browsers: [
                    			"> 0.5%",
                    			"IE 10"
                    		]
                    	}),
        				cleanCSS()
                    ])
                	.process(source, { from: inDirectory + name, to: outDirectory + name })
                    .then(result => {
                    	mkdirp(outDirectory, function(err) {
                    	    if (err) {
                    	        console.error(err);
                    	    }else{
                                fs.writeFile(outDirectory + name, result.css, function(err) {
                                    if (err) {
                                        console.error(err);
                                    }else{
                                        console.log(outDirectory + name + " generated, total time elapsed " + ( (Date.now() - timerStart) / 1000).toFixed(2) + " seconds" );
                                    }
                                });
                            }
                    	});
                    })
                }
            }
        });
    })
}

readDirRecursive(sourceDirectoryName + "/css/", publicDirectoryName + "/css/");
