console.log("Server Started");
var bodyParser = require('body-parser')
var express = require('express'); //expressjs to create front end
var swig = require('swig'); //template engine for express
var request = require('request');
var app = express();

app.set('port', 8000); //set port to 8000 instead of 80
app.listen(app.get('port'));


var client_id = "enterpriseapi-sb-HcJlRtRirL1le4oCp9a2FCrE";
var client_secret = "38122cd43791e4d114418df787af29cbb0d053f4";
var redirect_uri = "http://localhost:8000/redirect"
var access_token = "";

app.set('view engine', 'html'); //
app.set('views', __dirname +"/www"); //tell nodejs where html files are located
app.engine('html', swig.renderFile); //we are using Swig to render files

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

app.use(express.static(__dirname+"/www"));

app.get('/', function(req, res) {
    console.log("hi");
    res.render('index', { /* template locals context */ });
});
app.get('/redirect', function(req, res) {
    console.log("hi");

      var code = req.query.code;
      console.log("User Code: " + code);

		    	

		request({
		    url: 'https://api-sandbox.capitalone.com/oauth/oauth20/token', //URL to hit
		    method: 'POST',
		    headers: {
		        'content-type': 'application/x-www-form-urlencoded'
		    },
		   
			  body : "code="+code+"&client_id=" +client_id+ "&client_secret=" + client_secret	+ "&redirect_uri=http://localhost:8000/redirect&grant_type=authorization_code"
		}, function(error, response, body){
		    if(error) {
		        console.log(error);
		    } else {
		    	var access_token = JSON.parse(body).access_token; 	
		        console.log(JSON.parse(body));


				var options = {
				  url: 'https://api-sandbox.capitalone.com/rewards/accounts',
				  headers: {
				    'Authorization': 'Bearer '+ access_token, "Accept": "application/json;v=1"}
				};

				function callback(error, response, body) {
					console.log(body);
					    res.render('form', { /* template locals context */ });

				}

				request(options, callback);



		    }
		});





		

     
});


//curl -H "Content-Type:application/x-www-form-urlencoded&" "code=H_7qfdxNnj6hQildQn5pEJ8V-ygKx9EMLdUHrw&client_id=enterpriseapi-sb-HcJlRtRirL1le4oCp9a2FCrE&client_secret=38122cd43791e4d114418df787af29cbb0d053f4&redirect_uri=http://localhost:8000/redirect&grant_type=authorization_code" -X POST https://api-sandbox.capitalone.com/oauth/oauth20/token