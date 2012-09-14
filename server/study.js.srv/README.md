
## About
blablah

## requirements
* nodejs (http://nodejs.org/dist/v0.8.8/x64/node-v0.8.8-x64.msi)
* any webbrowser

## dependencies
* express : lightweight http server framework
* jade : js view template
* config : configuration module
* http-get : simple http module
* winston : logging system

## project layout
	/			:executing directory
 	/public		:static resources
 	/routes		:request routing & library code
 	/views		:view templates (not using)

## setup
	cd %executing directory% (see above)
	npm install

## execute
	cd %executing directory% (see above)
	node app.js

## test
	%open webbrowser%
	type location "http://localhost:2012/extapi/geo/continents"