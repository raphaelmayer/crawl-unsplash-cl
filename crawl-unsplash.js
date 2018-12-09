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
  	  	return done(new Error("Options are not defined.\n"));
  	}

	// validate parameter
	const validParams = ["-d", "-j", "-l"];
	if (validParams.indexOf(options.param) < 0) {
    	return done(new Error("Invalid parameter.\n"));
	}

	// validate query string
	if (options.query / 1 > 0 || options.query === undefined || options.query.substring(0, 1) === "-") {
    	return done(new Error("Invalid query.\n" ));
	}

	let pages = [];
	for (let i = options.startPage; i <= options.endPage; i++) {
		pages.push(i);
	}

	async.each(pages, doPerPage.bind(null, options.query), (err) => {
		done(err, options, images);
	});
}

function doPerPage(query, page, done) {
	const url = `https://unsplash.com/napi/search/photos?query=${query}&per_page=30&page=${page}`;
	request(url, (err, res, body) => {
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

	// recursively ensures unique filename
	const suffix = i ? ` (${i})` : "";	// eg. (1)
	fs.mkdir(`downloads/${filename}${suffix}`, (err) => {
		if (err) {
			downloadHandler(filename, images, i ? i + 1 : 1);
		} else {
    		images.map((img, i) => download(img.urls.raw, `downloads/${filename}${suffix}/${i}.jpg`, () => {
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
	    		console.log(`${(total.reduce((prev, curr) => prev + curr, 0) / 1000000).toFixed(2)} MB total.\ndownloading now...\n`)
	    	}
	  	});
	}
}

function writeJsonToFile(filename, i) {
	// recursively ensures unique filename
	const suffix = i ? ` (${i})` : "";	// eg. (1)
	fs.exists(`downloads/${filename}${suffix}.json`, (exists) => {
	  	if (exists) {
	  		writeJsonToFile(filename, i ? i + 1 : 1);
	  	} else {
			fs.writeFileSync(`downloads/${filename}${suffix}.json`, JSON.stringify(images, null, 2), "utf-8");
	  	}
	});
}


crawl(config, (err, options, images) => {	// callback fires when last page got fetched
	if (err) console.log(err);

	if (images) {
		console.log(`${images.length} images fetched.\n`);

		// decide what actions to take
    	if (options.param === "-l") {
    		console.log(images);
    	}
	
    	if (options.param === "-j" || options.param === "-d") {	// options.param.substring(0,1) === "-d"
			writeJsonToFile(options.query);
		}
	
    	if (options.param === "-d" || options.param === "-dL") {// options.param.substring(0,1) === "-d"
    	    downloadHandler(options.query, images, undefined, "raw");
    	}
  	} else {
		console.log("Nothing returned.");
	}
});

const size = (param) {
	if (param === "-dL") return "raw"
	if (param === "-dM") return "regular"
	if (param === "-dS") return "small"
}