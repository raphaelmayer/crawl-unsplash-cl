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
	if (options.query / 1 > 0 || options.query === undefined || options.query.substring(0, 1) === "-") {
    	return (done(new Error("Invalid query." )))
	}

	let pages = [];
	for (let i = options.startPage; i <= options.endPage; i++) {
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

function downloadHandler(filename, images, i) {
	// keeps track of total dl size and completed dls. (Maybe limit nr of concurrent dls in future version) 
	let total = [];
	let counter = 0;
	// const max = 10;

	// recursively check for unique filename							
	fs.mkdir(`downloads/${filename}`, (err) => {
		if (err) {
	  		const n = i ? i + 1 : 1;
			downloadHandler(`${config.query} (${n})`, images, n);
		} else {
    		images.map((img, i) => download(img.urls.raw, `downloads/${filename}/${i}.jpg`, () => {
    			counter++;
    			console.log(`${counter}/${images.length} done.`);
    		}));
		}
	})

	function download(uri, filename, done) {
	  	request.head(uri, (err, res, body) => {
	  		total.push(Number(res.headers['content-length']));
	    	request(uri).pipe(fs.createWriteStream(filename)).on('close', done);
	
	    	// log out total dl size once all dls are initiated
	    	if (total.length === images.length) {
	    		console.log(`${Math.round(total.reduce((prev, curr) => prev + curr, 0) / 1000000)} MB total.\ndownloading now...\n`)
	    	}
	  	});
	}
}

function writeJsonToFile(filename, i) {
	// recursively check for unique filename
	fs.exists(`downloads/${filename}.json`, (exists) => {
	  	if (exists) {
	  		const n = i ? i + 1 : 1;
	  		writeJsonToFile(`${config.query} (${n})`, n);
	  	} else {
			fs.writeFileSync(`downloads/${filename}.json`, JSON.stringify(images, null, 2), "utf-8");
	  	}
	});
}


crawl(config, (err, images) => {	// callback fires when last page got fetched
	if (err) console.log(err);

	if (images) {
		console.log(`${images.length} images fetched.\n`);

		// decide what actions to take
    	if (config.param === "-l") {
    		console.log(images);
    	}
	
    	if (config.param === "-j" || config.param === "-d") {
			writeJsonToFile(config.query);
		}
	
    	if (config.param === "-d") {
    	    downloadHandler(config.query, images);
    	}

  	} else {
		console.log("Nothing returned.");
	}
});