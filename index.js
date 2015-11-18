var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var p = require('./pairpicker.js');
var devs = require('./developers.json');
var Slack = require('node-slack');

var slack = new Slack(process.env.heroku_hook);
var slack_token = process.env.slack_token;

app.set('port', (process.env.PORT || 5000));

app.use(express.static(__dirname + '/public'));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', function(request, response) {
  response.render('pages/index', { devs: devs});
});

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
var reformattedArray = (function(kvArray) {
  return kvArray.map(function(obj){
    return obj.name;
  });
});

router.get('/', function(req, res) {
    if(req.query.token !== slack_token) {
      console.log('Invalid token');
      res.status(401).end('Invalid token');
    }
    else {
      console.log('Valid Token');
      var pairs  = p.generatePairs(reformattedArray(devs.devs));
      var names = pairs.map(function(pair) {
        return pair.join(" , ")
      }).join(" | ")

      slack.send({ text: names });
      res.status(200).end()
    }
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.post('/', function(req, res) {
    var g = p.generatePairs(["Nilhouse","Max"]);
    //res.json({ message: 'hooray! welcome to our api!' });
    res.json(g);
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});
