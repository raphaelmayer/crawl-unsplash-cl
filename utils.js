const fs = require("fs");

module.exports = {
	parseDownloadParameter,
	makeUniqueDirectory,
	estimateFilesize,
	reduceToMegabyte
}

function parseDownloadParameter(param) {
	if (param === "-dL" || param === "-d") return "full";
	if (param === "-dM") return "regular";
	if (param === "-dS") return "small";
}

// recursively ensures unique path
function makeUniqueDirectory(path, done, i) {
	const suffix = i ? ` (${i})` : "";	// eg. (1)

	fs.mkdir(`${path}${suffix}`, (err) => {
	  	if (err) {
	  		makeUniqueDirectory(path, done, i ? i + 1 : 1);
	  	} else {
	  		done(`${path}${suffix}`);
	  	}
	});
}

// use average filesizes to estimate
// because we don't know when initiating download
function estimateFilesize(imgQuality, imgCount) {
	if (imgQuality === "full") return 3.5 * imgCount;		// 301 / 90
	if (imgQuality === "regular") return 0.2 * imgCount;	// 17.3 / 90
	if (imgQuality === "small") return 0.04 * imgCount;		// 2.88 / 90
}

function reduceToMegabyte(total) {
	return (total.reduce((pr, cr) => pr + cr, 0) / 1000000).toFixed(2);
}