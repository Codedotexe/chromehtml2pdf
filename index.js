#!/usr/bin/env node

// Load packages that we need
const c = require('commander');
const p = require('puppeteer');
const url = require('url');

c.arguments('<file>');
c.option("--out <path>", 'Output file name.');
c.option('--executable-path <executablePath>');
c.option('--landscape');
c.option('--display-header-footer', 'Display header and footer. Defaults to false.');
c.option('--print-background', 'Print background graphics. Defaults to false.');
c.option('--scale <scale>', 'Scale of the webpage rendering. Defaults to 1.'); //float
c.option('--width <width>', 'Paper width with units. Defaults to 8.5in.');
c.option('--height <height>', 'Paper height with units. Defaults to 11in.');
c.option('--format <format>', 
	'Format of page. This takes precedence over height/width. Options are Letter: '+
	'8.5in x 11in\n'+
	'Legal: 8.5in x 14in\n'+
	'Tabloid: 11in x 17in\n'+
	'Ledger: 17in x 11in\n'+
	'A0: 33.1in x 46.8in\n'+
	'A1: 23.4in x 33.1in\n'+
	'A2: 16.5in x 23.4in\n'+
	'A3: 11.7in x 16.5in\n'+
	'A4: 8.27in x 11.7in\n'+
	'A5: 5.83in x 8.27in\n'+
	'A6: 4.13in x 5.83in\n'
);
c.option('--margin-top <marginTop>', 'Top margin with units. Defaults to 1cm (~0.4 inches).');
c.option('--margin-bottom <marginBottom>', 'Bottom margin with units. Defaults to 1cm (~0.4 inches).');
c.option('--margin-left <marginLeft>', 'Left margin with units. Defaults to 1cm (~0.4 inches).');
c.option('--margin-right <marginRight>', 'Right margin with units. Defaults to 1cm (~0.4 inches).');
c.option('--page-ranges <pageRanges>', 'Paper ranges to print, e.g., \'1-5, 8, 11-13\'. Defaults to the empty string, which means print all pages.');
c.option('--header-template <headerTemplate>', 
	'HTML template for the print header. Should be valid HTML markup with following classes '+
	'used to inject printing values into them: date - formatted print date; title - document title; url - document '+
	'location; pageNumber - current page number; totalPages - total pages in the document. For example, '+
	'<span class="title"></span> would generate a span containing the title. Make sure margins are such that '+
	'the header will fit on the page. You may also need to explicity use CSS to set the font-size.'
);
c.option('--footer-template <footerTempate>', 'HTML template for the print footer. Should use the same format as the `headerTemplate`. See there for more information.');
c.option('--no-sandbox', 'Launch chrome without sandbox');
c.option('--local-file', 'Is path a local file');


c.action(function(file){
	console.log('Converting file: '+file);

	if(c.localFile) {
		try {
			file = url.pathToFileURL(file).href;
		} catch(e) {
			console.log("Not input is not a valid path")
			process.exit(1);
		}
	}

	// Prepare the config object            
	var config = {};
	if(c.out) {
		config.path = c.out;
	} else {
		console.log("You need to include a parameter --out to hold the output file name.");
		process.exit(1);
	}
	if(c.landscape) {
		config.landscape = c.landscape;
	}
	if(c.displayHeaderFooter) {
		config.displayHeaderFooter = c.displayHeaderFooter;
	}
	if(c.printBackground) {
		config.printBackground = c.printBackground;
	}
	if(c.scale) {
		config.scale = parseFloat(c.scale);
	}
	if(c.width) {
		config.width = c.width;
	}
	if(c.height) {
		config.height = c.height;
	}
	if(c.format) {
		config.format = c.format;
	}
	if(c.marginTop) {
		console.log('marginTop = '+c.marginTop);
		config.marginTop = c.marginTop;
	}
	if(c.marginBottom) {
		console.log('marginBottom = '+c.marginBottom);
		config.margin.bottom = c.marginBottom;
	}
	if(c.marginLeft) {
		console.log('marginLeft = '+c.marginLeft);
		config.margin.left = c.marginLeft;
	}
	if(c.marginRight) {
		console.log('marginRight = '+c.marginRight);
		config.margin.right = c.marginRight;
	}
	if(c.headerTemplate) {
		config.headerTemplate = c.headerTemplate;
	}
	if(c.footerTempate) {
		config.footerTempate = c.footerTempate;
	}
		
	// Get the page to create the PDF.
	(async () => {
		try{
			var launchConfig = {};
			if(c.executablePath){
				console.log('Using chrome executable: '+c.executablePath);
				launchConfig.executablePath = c.executablePath;
			}
			if(!c.sandobox) {
				launchConfig.args = ["--no-sandbox"];
			}
			const browser = await p.launch(launchConfig);
			const page = await browser.newPage();
			await page.goto(file, {waitUntil: 'networkidle0',timeout:0});
			await page.pdf(config);	
			await browser.close();
		}
		catch(e){
			console.log(e);
			process.exit(1);
		}
	})();
}).parse(process.argv);
// console.log(process.argv);
