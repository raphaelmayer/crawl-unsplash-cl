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

// keep track of total dl size and completed dls. (Maybe limit nr of concurrent dls in future version) 
function downloadHandler(images) {
	// const max = 10;
	let total = [];
	let counter = 0;
															// if starting from page 2 starts naming from 31++
    images.map((img, i) => download(img.urls.raw, `downloads/${config.query}/${i+(config.startPage-1)*30}.jpg`, () => {
    	counter++;
    	console.log(`${counter}/${images.length} done.`);
    }));

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

// recursively check for unique filename
function ensureUniqueName(filename, i) {
	fs.exists(`downloads/${filename}.json`, (exists) => {
	  	if (!exists) {
			return filename;
	  	} else {
	  		const n = i ? i + 1 : 1;
	  		ensureUniqueName(`${config.query} (${n})`, n);
	  	}
	});
}


crawl(config, (err, images) => {	// fires when last page got fetched
	if (err) console.log(err);

	if (images) {
		console.log(`${images.length} images fetched.\n`);

	// decide what actions to take
    if (config.param === "-l") {
    	console.log(images);
    }

    if (config.param === "-j" || config.param === "-d") {
		fs.writeFileSync(`downloads/${ensureUniqueName(config.query)}.json`, JSON.stringify(images, null, 2), "utf-8");
    }

    if (config.param === "-d") {
      	fs.mkdir(`downloads/${config.query}`, (err) => {
        	downloadHandler(images);
      	})
    }

  } else {
		console.log("Nothing returned.");
	}
});