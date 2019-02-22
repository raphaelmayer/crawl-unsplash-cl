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

- `-j`: Download a JSON file containing data and links to images.
- `-d`: Download a JSON file and all images.
- `-l`: Print JSON to console without downloading any files.

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

Define the amount of pages to be fetched. One page is 30 images.
You may split the pages argument into 2 seperate arguments to define a start and end page. The end page will be included. To fetch one specific page eg. page 2 use `2 2`.

## Examples
`node crawl -d wanderlust` fetches the first page and downloads all images and the JSON file.

`node crawl -l wanderlust 10` fetches pages 1 to 10 and logs JSON to console.

`node crawl -j wanderlust 10 20` fetches pages 10 to 20 and downloads the JSON file.


Images and JSON lists are in order, although when fetching additional pages at a later point without clearing the downloads directory will most likely result in inconsistent results, since those pages update content so frequently and page 1 today might be page 10 tomorrow. 

Concurrent downloads are currently limited to 20 at one time, although it might make sense to implement a limit by user input at some point. 

## Contributions
Contributions are welcome. Concisely state the problem and how you solved it. Do not fix multiple things in one PR. If you happen to find something else to fix while fixing any part of the code, please open another PR if you want to address this issue aswell. 