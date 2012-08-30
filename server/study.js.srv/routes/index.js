
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', { title: 'Express' });
};

exports.example01 = function(req, res){
	var result = {};

	switch (req.sid) {
		case "01" :
			result = {}
			break;
		case "02" :
			break;
		default :
			break;
	}
	
	res.json(result);
};

exports.api = require("./api");