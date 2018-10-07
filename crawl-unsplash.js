const request = require("request");
const async = require("async");
const fs = require("fs");

const config = {
  	param: process.argv[2],
  	query: process.argv[3],
	url: `https://unsplash.com/napi/search/photos?query=${process.argv[3]}&per_page=30&page=`,
	endPage: process.argv[5] ? process.argv [5] : process.argv[4] || 1,
	startPage: process.argv[5] ? process.argv [4] : 1
};

let images = [];

function crawl(options, done) {
  	if (!options) {
  	  	return (done(new Error("Options are not defined.")))
  	}
	// validate parameter
	if (options.param !== "-d" && options.param !== "-j" && options.param !== "-l") {
    	return (done(new Error("Invalid parameter.")))
	} 
	// validate query string
	if (config.query / 1 > 0 || config.query === undefined || config.query.substring(0, 1) === "-") {
    	return (done(new Error("Invalid query." )))
	}

	let pages = [];
	for (let i = config.startPage; i <= config.endPage; i++) {
		pages.push(i);
	}

	async.each(pages, doPerPage, (err) => {
		done(err, images);
	});
}

function doPerPage(page, done) {
	request(config.url + `${page}` , (err, res, body) => {
		if (err) done(err);

		if (res && res.statusCode == 200) {
			const json = JSON.parse(body);
			page === 1 && console.log(`${json.total} total results.\n${json.total_pages} total pages.`);

			json.results.map(img => images.push(img));
			done();
		} else {
			done(new Error(`Could not request unsplash. (${res && res.statusCode})`));
		}

	})
}

function download(uri, filename, done) {
  	request.head(uri, (err, res, body) => {
    	//console.log('content-type:', res.headers['content-type']);
    	//console.log('content-length:', res.headers['content-length']);
    
    	request(uri).pipe(fs.createWriteStream(filename)).on('close', done);
  	});
};


crawl(config, (err, images) => {
	if (err) console.log(err);

	if (images) {
		console.log(`${images.length} images fetched.\n`);

    if (config.param === "-l") {
    	console.log(images);
    }

    if (config.param === "-j" || config.param === "-d") {
    	const makeUniqueName = (filename) => {
    		fs.exists(`downloads/${filename}.json`, (exists) => {
			  	if (!exists) {
			  		console.log(`${filename} !exists`)
    				fs.writeFileSync(`downloads/${filename}.json`, JSON.stringify(images, null, 2), "utf-8");
			  	} else {
			  		console.log(`${filename} exists`)
			  		makeUniqueName(`${filename}_copy`);
			  	}
			});
		}
		makeUniqueName(config.query);
    }

    if (config.param === "-d") {
      	console.log("downloading...")
      	fs.mkdir(`downloads/${config.query}`, (err) => {
        	let counter = 0;
        	images.map((img, i) => download(img.urls.raw, `downloads/${config.query}/${i+(config.startPage-1)*30}.jpg`, () => {
          		counter++;
          		console.log(`${counter}/${images.length} done.`)
        	}));
      	})
    }

  } else {
		console.log("Nothing returned.");
	}
});