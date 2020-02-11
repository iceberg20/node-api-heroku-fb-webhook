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



function getPSID(req){
  let msg = req.body.entry[0].messaging[0];
  let psid = msg.sender.id;
  return psid;
}

async function getContext(psid){
  try{
    let cliente = await pool.connect();
    let resultado = await cliente.query("select contexto from usuario where psid="+psid);
    console.log(resultado.rows[0].contexto);
    return resultado.rows[0].contexto;
  } catch(e){
      console.log(e);
      return [];
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

//Métodos de teste
app.get('/teste/getcontext', async function (req, res) {
  let psid = req.query.psid;
  console.log("param "+psid);
  let out = await getContext(psid);
  console.log("### OUT ###: "+out);

  res.send(out);
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}  

//Testes
app.post('/webhook/', function (req, res) {
  console.log("#######################  Webhook ##################");
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


app.get('/find_psid/:psid', function (req, res){
  find_psid()
  console.log("aew");
  res.status('200').send({card: 'card'});
});

function find_psid(){
  try{
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      result = client.query("select contexto from usuario where psid="+psid, (err, result) => {
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
  } catch(e){
      console.log(e);
  }
}

//Porta padrão da aplicação
app.listen(PORT, function (){
	console.log('Second server listening on port 3000!');
});