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
		    	global.access_token = JSON.parse(body).access_token; 	
		        console.log(JSON.parse(body));
		        console.log("------------------" + global.access_token)


				var options = {
				  url: 'https://api-sandbox.capitalone.com/rewards/accounts',
				  headers: {
				    'Authorization': 'Bearer '+ global.access_token, "Accept": "application/json;v=1"}
				};

				function callback(error, response, body2) {
					console.log(body2);
					console.log(JSON.stringify(body2));
					    res.render('form', { rewardAccounts: new Buffer(JSON.stringify(body2)).toString('base64') });

				}

				request(options, callback);



		    }
		});
});

app.get('/submit', function(req, res) {

		var id = req.query.id;
		var goal = req.query.goal;
 
		console.log("\nid\n\n" + id);

		console.log("\n\ngoal" + goal);


		console.log("Access Token #2: " + global.access_token)
		
		var options = {
				  url: 'https://api-sandbox.capitalone.com/rewards/accounts/'+encodeURIComponent(id),
				  headers: {
				    'Authorization': 'Bearer '+ global.access_token, "Accept": "application/json;v=1"}
				};

				function callback(error, response, body2) {
					console.log(body2);
					var percent = 10* goal / (JSON.parse(body2).rewardsBalance + 0.0);
					console.log(percent);

					writeToArduino(percent);
					res.write("good");
					res.end();
						    
				}

				request(options, callback);
				
});

function writeToArduino(percent) {
	
}
//curl -H "Content-Type:application/x-www-form-urlencoded&" "code=H_7qfdxNnj6hQildQn5pEJ8V-ygKx9EMLdUHrw&client_id=enterpriseapi-sb-HcJlRtRirL1le4oCp9a2FCrE&client_secret=38122cd43791e4d114418df787af29cbb0d053f4&redirect_uri=http://localhost:8000/redirect&grant_type=authorization_code" -X POST https://api-sandbox.capitalone.com/oauth/oauth20/token