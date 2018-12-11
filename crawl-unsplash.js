const request = require("request");
const async = require("async");
const fs = require("fs");
const h = require("./helpers");

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
	const validParams = ["-d", "-dL", "-dM", "-dS", "-j", "-l"];
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

function downloadHandler(images, dir, imgQuality) {
	// keeps track of total dl size and completed dls.
	let total = [];
	let counter = 0;
	const limit = 20;
	console.log(`total file size will be around ${h.estimateFilesize(imgQuality, images.length)} MB.\ndownloading now...\n`);

	async.eachOfLimit(images, limit, (img, i, done) => {
		download(img.urls[imgQuality], `${dir}/${i}.jpg`, done);	
	}, (err) => {
    	if (err) console.error(err);
    	console.log(`\ndone.\ndownloaded ${total.length} images (${h.reduceToMegabyte(total)} MB)`);
	});

	function download(uri, dir, done) {
	  	request.head(uri, (err, res) => {
	  		if (err) console.error("DL REQUEST ERR: ", err);

	  		total.push(Number(res.headers['content-length']) || 0);
	    	request(uri).pipe(fs.createWriteStream(dir)).on('close', (err) => {
	    		counter++;
	    		console.log(`${counter} / ${images.length}`);
	    		done(err);
	    	});
	  	});
	}
}

function writeJsonToFile(dir, i) {
	fs.writeFileSync(`${dir}/list.json`, JSON.stringify(images, null, 2), "utf-8");
}

crawl(config, (err, options, images) => {	// callback fires when last page got fetched
	if (err) console.log(err);

	if (images) {
		const { param, query } = options;
		console.log(`${images.length} images fetched.\n`);

		// decide what actions to take
    	if (param === "-l") {
    		console.log(images);
    	} else {
    		h.makeUniqueDirectory(`downloads/${query}`, (dir) => {
				writeJsonToFile(dir);
		
    			if (param.substring(0, 2) === "-d") {
    			    downloadHandler(images, dir, h.parseDownloadParameter(param));
    			}
    		});
		}
  	} else {
		console.log("Nothing returned.");
	}
});