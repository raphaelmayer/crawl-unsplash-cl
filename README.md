# Crawl-Unsplash-CLI
A simple node.js command line tool to scrape and download royalty free HD images from https://unsplash.com.
If you happen to find a bug or want to suggest a feature, feel free to contact me or *contribute*.

## Install
- Download repository `https://github.com/raphaelmayer/crawl-unsplash-cl.git`
- Navigate to directory or `cd yourpath/crawl-unsplash-cl`
- In your shell of choice type `npm install` to install dependencies.
- Done. Now go and get some images!

## Usage
From the directory of the repository run:
`node crawl <parameter> <query> <pages>`

### Parameter
*Parameter is required.*

The parameter determines what to do with the fetched data. 

- `-l`: Print fetched data to console without downloading any files.
- `-j`: Dump image data into a JSON file without downloading any images.
- `-d`: Dump image data into a JSON file and download all images.

You may use variations of the download parameter `-d` to further specify the image size. 
You can choose between 
- `-dL` for the raw image (~ 4k), 
- `-dM` for a mediumsized image (~ 1080x720),
- `-dS` for a small image (~ 400x300).

**Note:** Downloading a lot of large images will become a huge download very quickly.


### Query
*Query has to be a string and is required.* 

The query is a string and determines the theme / kind of images you will get.

### Pages
*Pages are optional and if omitted default to 1.*

Define the number of pages to be fetched. One page amounts to 30 images.
You may split the pages argument into 2 seperate arguments to define a start and end page. The end page will be included. To fetch one specific page eg. page 2 use `2 2`.

## Examples
`node crawl -d wanderlust` fetches the first page and downloads all images and creates a JSON file.

`node crawl -l wanderlust 10` fetches pages 1 to 10 and logs JSON to console.

`node crawl -j wanderlust 10 20` fetches pages 10 to 20 and creates a JSON file.

## Additional notes
Concurrent downloads are currently limited to 20 at one time, although it might make sense to implement a limit by user input at some point. 

## Contributions
If you want to contribute or have suggestions feel free to open a PR, raise an issue or get in touch. 
