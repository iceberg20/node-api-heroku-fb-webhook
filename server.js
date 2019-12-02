//Config Express
var PORT = process.env.PORT || 3000;
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var fs = require('fs');

var s = require("./math");

var http = require('http');

//App init
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors()); 

app.use('/static', express.static('public'));

var getTarefas = function (req, res){
  var dados = {status: "ok", app: "running"};
  console.log(" # Console.log()");

  res.send(JSON.stringify(dados));
};

//Serviços da API
app.get('/tarefas', getTarefas);

app.get('/version', (req, res) => {
  return res.send('1');
});

app.get('/', (req, res) => {
  return res.send('Received a GET HTTP method');
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

app.post("/webhook", function(req, res) {
  var intent_name = req.body.queryResult.intent.displayName;
  var speech = "";
  if (intent_name == "echo") {
    speech = "echo";
  } else if(intent_name = "T004-webhook1") {
    speech = "T004-webhook1";
  } else if (intent_name = "T005-hook"){
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


