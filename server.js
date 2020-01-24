//Config Express
var PORT = process.env.PORT || 3000;
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var request = require('request')
var fs = require('fs');
const { Client } = require('pg');
const client = new Client({
  connectionString: process.env.DATABASE_URL,  
  ssl: true,
});


var s = require("./math");

var http = require('http');

//App init
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors()); 

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/static', express.static('public'));


app.get('/heroku_db', (req, res) => {
  let saida ="";
client.connect();
  client.query('select * from teste_table', (err, res) => {
    if (err) throw err;
    saida = JSON.stringify(res.rows[0]);
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
  res.send(saida);
});

var getTarefas = function (req, res){
  var dados = {status: "ok", app: "running"};
  console.log(" # Console.log()");

  res.send(JSON.stringify(dados));
};

//Serviços da API
app.get('/tarefas', getTarefas);
app.get('/version', (req, res) => {
  return res.send('5');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'trelabs_sj') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

// API End Point - added by Stefan

app.post('/webhook/', function (req, res) {
  console.log("#######################  Webhook ##################");
  console.log(req);
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i]
        sender = event.sender.id
        if (event.message && event.message.text) {
            text = event.message.text
            console.log(text);
            if ( text == "Iniciar acompanhamento" || text == "cd") {
              sendTextMessage(sender, "Acompanhamento iniciado");
            } else {
              sendTextMessage(sender, "Estamos em fase de testes: " + text.substring(0, 200))
            }


            
        }
        if (event.postback) {
            text = JSON.stringify(event.postback)
            sendTextMessage(sender, "Postback received: "+text.substring(0, 200), token)
            continue
        }
    }
    res.sendStatus(200)
});

var token = "EAAYxzACKqZAsBAJcnacHvK0Yg7DZA20gsFyKjcaV7cpS1NZBX300oXsGNvYXPjJTYTjVIhSi6tNn9byyicNdgp8G4WxHapt6JE56o8udTtWZAKY6Amr1ayDVwTnDfvcRqSvXS25EEMC5KefMaijOZBouyEnuGcdvIZALRX8K18xtSJqx8dv9zM";

// function to echo back messages - added by Stefan

function sendTextMessage(sender, text) {
    messageData = {
        text:text
    }
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {access_token:token},
        method: 'POST',
        json: {
            recipient: {id:sender},
            message: messageData,
        }
    }, function(error, response, body) {
        if (error) {
            console.log('Error sending messages: ', error)
        } else if (response.body.error) {
            console.log('Error: ', response.body.error)
        }
    })
}

// index page 
app.get('/', function(req, res) {
    var drinks = [
        { name: 'Bloody Mary', drunkness: 3 },
        { name: 'Martini', drunkness: 5 },
        { name: 'Scotch', drunkness: 10 }
    ];
    var tagline = "EJS adicionaod com sucesso";

    res.render('pages/index', {
        drinks: drinks,
        tagline: tagline
    });
});
app.post('/', (req, res) => {
  return res.send('Received a POST HTTP method');
});
app.put('/', (req, res) => {
  return res.send('Received a PUT HTTP method');
});
app.delete('/', (req, res) => {
  return res.send('Received a DELETE HTTP method');
});

//Webhook
app.get('/getName',function (req,res){
  res.send('Swarup Bam');
});

app.post('/getMovies',function (request,response)  {
  response.setHeader('Content-Type', 'application/json');

  
  response.send(JSON.stringify({
    "speech" : "speech do webhook",
    "displayText" : "displayText"
  })); 
});

app.post("/webhook_old", function(req, res) {
  var intent_name = req.body.queryResult.intent.displayName;
  var speech = "";
  if (intent_name == "echo") {
    speech = "echo";
  } else if(intent_name == "T004-webhook1") {
    speech = "T004-webhook1";
  } else if (intent_name == "T005-hook"){
    speech = "T005-hook";
  } else {
    speech = "Erro webhook!"
  }

  var speechResponse = {
    google: {
      expectUserResponse: true,
      richResponse: {
        items: [
          {
            simpleResponse: {
              textToSpeech: speech
            }
          }
        ]
      }
    }
  };

    //Logs
    console.log("##### Req ######");
    console.log(req);
    console.log("##### Req Body ######");
    console.log(req.body);
    console.log("##### Intent Name ######");
    console.log(intent_name);
  
  return res.json({
    payload: speechResponse,
    //data: speechResponse,
    fulfillmentText: speech,
    speech: speech,
    displayText: speech,
    source: "webhook-echo-sample"
  });
});





//Porta padrão da aplicação
app.listen(PORT, function (){
	console.log('Second server listening on port 3000!');
});