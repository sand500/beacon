console.log("Server Started");
var bodyParser = require('body-parser')
var express = require('express'); //expressjs to create front end
var swig = require('swig'); //template engine for express
var request = require('request');
var app = express();
var async = require('async');

/*
var SerialPort = require('serialport');
var arduinoPort = new SerialPort('/dev/cu.usbmodem1411', function(err) {
    if (err) {
        return console.log('Error: ', err.message);
    }

});
*/

app.set('port', 8000); //set port to 8000 instead of 80
app.listen(app.get('port'));


var client_id = "enterpriseapi-sb-HcJlRtRirL1le4oCp9a2FCrE";
var client_secret = "38122cd43791e4d114418df787af29cbb0d053f4";
var redirect_uri = "http://localhost:8000/redirect"

app.set('view engine', 'html'); //
app.set('views', __dirname + "/www"); //tell nodejs where html files are located
app.engine('html', swig.renderFile); //we are using Swig to render files

app.use(bodyParser.urlencoded({
    extended: false
}))
app.use(bodyParser.json())

app.use(express.static(__dirname + "/www"));

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

        body: "code=" + code + "&client_id=" + client_id + "&client_secret=" + client_secret + "&redirect_uri=http://localhost:8000/redirect&grant_type=authorization_code"
    }, function(error, response, body) {
        if (error) {
            console.log(error);
        } else {
            global.access_token = JSON.parse(body).access_token;
            console.log(JSON.parse(body));
            console.log("------------------" + global.access_token)


            var options = {
                url: 'https://api-sandbox.capitalone.com/rewards/accounts',
                headers: {
                    'Authorization': 'Bearer ' + global.access_token,
                    "Accept": "application/json;v=1"
                }
            };

            function callback(error, response, body2) {
                console.log(body2);
                console.log(JSON.stringify(body2));


                var response_object = JSON.parse(body2);

                var numAccs = response_object.rewardsAccounts.length;

                for (var i = 0; i < response_object.rewardsAccounts.length; i++) {


                    (function(val) {

                        var rewardObject = response_object.rewardsAccounts[val];

                        console.log("Getting Balance of" + rewardObject.rewardsAccountReferenceId);
                        var options = {
                            url: 'https://api-sandbox.capitalone.com/rewards/accounts/' + encodeURIComponent(rewardObject.rewardsAccountReferenceId),
                            headers: {
                                'Authorization': 'Bearer ' + global.access_token,
                                "Accept": "application/json;v=1"
                            }
                        };

                        request(options, callbackBalance);

                        function callbackBalance(error, response, body3) {
                            console.log(body3);
                            console.log("balance " + JSON.parse(body3).rewardsBalance);

                            response_object.rewardsAccounts[val].balance = JSON.parse(body3).rewardsBalance;
                            numAccs--;
                            if (numAccs == 0) {
                                res.render('form', {
                                    rewardAccounts: new Buffer(JSON.stringify(JSON.stringify(response_object))).toString('base64')
                                });
                            }
                        }

                    })(i)




                }




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
        url: 'https://api-sandbox.capitalone.com/rewards/accounts/' + encodeURIComponent(id),
        headers: {
            'Authorization': 'Bearer ' + global.access_token,
            "Accept": "application/json;v=1"
        }
    };

    function callback(error, response, body2) {
        console.log(body2);
        console.log("balance " + JSON.parse(body2).rewardsBalance);
        console.log("goal    " + goal);

        var numBars = Math.floor((10 * JSON.parse(body2).rewardsBalance) / goal);
        console.log(numBars);

        //writeToArduino(numBars);
        res.write("good");
        res.end();

    }

    request(options, callback);

});

/*function writeToArduino(numBars) {
  arduinoPort.write(numBars+'', function(err) {
      if (err) {
        return console.log('Error on write: ', err.message);
      }
      console.log('message sent');
  });
}

arduinoPort.on('data', function (data) {
  console.log('Data: ' + data);
});*/
//curl -H "Content-Type:application/x-www-form-urlencoded&" "code=H_7qfdxNnj6hQildQn5pEJ8V-ygKx9EMLdUHrw&client_id=enterpriseapi-sb-HcJlRtRirL1le4oCp9a2FCrE&client_secret=38122cd43791e4d114418df787af29cbb0d053f4&redirect_uri=http://localhost:8000/redirect&grant_type=authorization_code" -X POST https://api-sandbox.capitalone.com/oauth/oauth20/token