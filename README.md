# Crawl-Unsplash-CL
A simple command line tool to scrape images from https://unsplash.com.
If you happen to find a bug or want to suggest a feature, feel free to contact me or *contribute*.

## Install
- download repository
- `cd yourpath/crawl-unsplash-cl`
- `npm install`

## Usage
from the directory of the repository run:
`node crawl-unsplash <parameter> <query> <pages>`

### Parameter
- **-j**: Download a JSON file containing data and links to images.
- **-d**: Download a JSON file and all images.
- **-l**: Print the data to console without downloading an files.

*Parameter is NOT optional.*
### Query
*Query has to be a string and is NOT optional.* 

### Pages
Define the amount of pages to be fetched. One page is 30 images.
You may split the pages arg into 2 seperate args to define a start and end page. The end page will be included. To fetch one specific page eg. page 2 use `2 2`.

*Pages are optional and if omitted default to 1.*

## Examples
`node crawl-unsplash -d wanderlust` fetches the first page and downloads all images and the JSON file.

`node crawl-unsplash -l wanderlust 10` fetches pages 1 to 10 and logs JSON to console..

`node crawl-unsplash -j wanderlust 10 20` fetches pages 10 to 20 and downloads the JSON file.


Images and JSON lists are in order, although when fetching additional pages at a later point without clearing the downloads directory will most likely result in inconsistent results, since those pages update content so frequently and page 1 today might be page 10 tomorrow. 


## Contributions
Contributions are welcome. Concisely state the problem and how you solved it. Do not fix multiple things in one PR. If you happen to find something else to fix while fixing any part of the code, please open another PR if you want to address this issue aswell. 
