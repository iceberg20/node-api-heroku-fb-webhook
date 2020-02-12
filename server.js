//Config Express
var PORT = process.env.PORT || 3000;
require('dotenv').config();
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var request = require('request');
var fs = require('fs');
var http = require('http');
var str_con = process.env.STR_CON;

// DB poll config
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || str_con,
  ssl: true
});

//App init
var app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

app.set('view engine', 'ejs');

app.use('/static', express.static('public'));

app.get('/add_user', (req, res) => {
  try {
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
  catch (e) {
    console.log(e);
  }
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
  if (req.query['hub.verify_token'] === 'trelabs_sj') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
});

function getPSID(req) {
  let msg = req.body.entry[0].messaging[0];
  let psid = msg.sender.id;
  return psid;
}

async function getContext(psid) {
  try {
    let cliente = await pool.connect();
    let resultado = await cliente.query("select contexto from usuario where psid=" + psid);
    console.log(resultado.rows[0].contexto);
    return resultado.rows[0].contexto;
  } catch (e) {
    console.log(e);
    return [];
  }
}

var token = "EAAYxzACKqZAsBAJcnacHvK0Yg7DZA20gsFyKjcaV7cpS1NZBX300oXsGNvYXPjJTYTjVIhSi6tNn9byyicNdgp8G4WxHapt6JE56o8udTtWZAKY6Amr1ayDVwTnDfvcRqSvXS25EEMC5KefMaijOZBouyEnuGcdvIZALRX8K18xtSJqx8dv9zM";

// function to echo back messages - added by Stefan

function sendTextMessage(sender, text) {
  messageData = {
    text: text
  }
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: token },
    method: 'POST',
    json: {
      recipient: { id: sender },
      message: messageData,
    }
  }, function (error, response, body) {
    if (error) {
      console.log('Error sending messages: ', error)
    } else if (response.body.error) {
      console.log('Error: ', response.body.error)
    }
  })
}

// index page 
app.get('/', function (req, res) {
  res.render('pages/index');
});

app.get('/teste/getcontext', async function (req, res) {
  let psid = req.query.psid;
  console.log("param " + psid);
  let out = await getContext(psid);
  if(out==[]){

  }
  console.log("### OUT ###: " + out);

  res.send(out);
});

async function get_psid(req){
  event = req.body.entry[0].messaging[0]
  sender = event.sender.id
  return sender;
}

//implementar
async function save_psid(){
  return "implementar";
}

app.post('/webhook/', async function (req, res) {
  messaging_events = req.body.entry[0].messaging
  var psid = await get_psid(req);
  console.log("# psid="+psid);
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i]
    sender = event.sender.id
    if (event.message && event.message.text) {
      text = event.message.text
      console.log(text);
      if (text == "Iniciar acompanhamento" || text == "cd") {
        sendTextMessage(sender, "Primeiro deixa eu ver ser vc já tem um cadastro");        
        console.log("param " + psid);
        let context = await getContext(psid);
        console.log("# contexo ="+context);
        if(context=="cadastrado"){
          sendTextMessage(sender, "Você já tem uma cadastro");      
        } else  {
          sendTextMessage(sender, "Você ainda não tem um cadastro, vamos fazer agora");
        }
      } else {
        sendTextMessage(sender, "Estamos em fase de testes: " + text.substring(0, 200))
      }
    }
    if (event.postback) {
      text = JSON.stringify(event.postback)
      sendTextMessage(sender, "Postback received: " + text.substring(0, 200), token)
      continue
    }
  }
  res.sendStatus(200)
});

function find_psid() {
  try {
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      result = client.query("select contexto from usuario where psid=" + psid, (err, result) => {
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
          console.log(" # Deu erro porque veio vazio #");
        }
        console.log(" # O resultado pode estar vazio #");
        console.log(result.rows)
      })
    })
    res.send("funcionou!");
  } catch (e) {
    console.log(e);
  }
}

//Porta padrão da aplicação
app.listen(PORT, function () {
  console.log('Second server listening on port 3000!');
});