//Config Express
var PORT = process.env.PORT || 3000;
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var request = require('request');
var fs = require('fs');
var str_con = process.env.STR_CON; 

// DB poll config
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || str_con,
  ssl: true
});

var http = require('http');

//App init
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors()); 

// set the view engine to ejs
app.set('view engine', 'ejs');

app.use('/static', express.static('public'));

//teste new table usuario
app.get('/db_teste', (req, res) => {
 try{
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    result = client.query('select * from usuario', (err, result) => {
      release()
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      console.log(result.rows)
    })
  });
  res.send("funcionou!"); 
}
  catch(e){
    console.log(e);
  }
});

app.get('/add_user', (req, res) => {
 try{
  pool.connect((err, client, release) => {
    if (err) {
      return console.error('Error acquiring client', err.stack)
    }
    result = client.query("insert into usuario values(2,2,'cadastro','666','5555','advogado')", (err, result) => {
      release()
      if (err) {
        return console.error('Error executing query', err.stack)
      }
      console.log(result.rows)
    })
  })  
  res.send("funcionou!"); 
}
  catch(e){
    console.log(e);
  }
});

app.get('/heroku_db', (req, res) => {
let saida ="";
client.connect();
 try{
  client.query('select * from teste_table', (err, res) => {
    if (err) throw err;
    saida = res.rows;
    for (let row of res.rows) {
      console.log(JSON.stringify(row));
    }
    client.end();
  });
 }
  catch(e){
    console.log(e);
  }
  res.send("string");
});

app.get('/version', (req, res) => {
  return res.send('21');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
    if (req.query['hub.verify_token'] === 'trelabs_sj') {
        res.send(req.query['hub.challenge'])
    }
    res.send('Error, wrong token')
});

// API End Point 
app.post('/webhook/', function (req, res) {
  
    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {

        console.log(getPSID);
        if (event.message && event.message.text) {
            text = event.message.text
            console.log(text);
            if ( text == "Iniciar acompanhamento" || text == "cd") {
              sendTextMessage(sender, "Ok, primeiro preciso fazer o seu cadastro");
              sendTextMessage(sender, "Qual o seu nome?");
              let contexto = setContext("cadastro_nome");
              sendTextMessage(sender, contexto);
            } else {
              sendTextMessage(sender,"Para mais informações ligue para (84) 3654-6000");
              sendTextMessage(sender,"Ou vá até o TRE-RN no endereço Av. Rui Barbosa, 215 - Tirol, Natal - RN, 59015-290");              
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

//Para implementar
function setContext(contexto){
  console.log("set_context= "+contexto);
  return contexto;
}

//Para implementar
function getPSID(req){
  try{
    event = req.body.entry[0].messaging[i];
    psid = event.sender.id;
    console.log("get PSID");
    return psid;
  } catch(e){
    console.log("error to get PSID");
    console.log(e);
  }
}

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
    res.render('pages/index');
});

app.post("/webhook_select_intent", function(req, res) {
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