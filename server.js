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

// for Facebook verification
app.get('/webhook/', function (req, res) {
  let verify_token = req.query['hub.verify_token'];
  if ( verify_token === 'trelabs_sj') {
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
    let resultado = await cliente.query("select contexto from usuario where psid='"+psid+"'");
    let contexto = "";
    if(resultado.rowCount>0){
      if(contexto = resultado.rows[0].contexto){
        contexto = resultado.rows[0].contexto;
      }
    } else {
      contexto = "sem_contexto";
    }
    console.log(psid);
    return contexto;
  } catch (e) {
    console.log(e);
    return [];
  }
}

//token da página do TRE-RN
var token = "EAAYxzACKqZAsBAJcnacHvK0Yg7DZA20gsFyKjcaV7cpS1NZBX300oXsGNvYXPjJTYTjVIhSi6tNn9byyicNdgp8G4WxHapt6JE56o8udTtWZAKY6Amr1ayDVwTnDfvcRqSvXS25EEMC5KefMaijOZBouyEnuGcdvIZALRX8K18xtSJqx8dv9zM";

//token da página do teste 2
var token = "EAAoQNGvOt1kBAO4UQuK4KKtpZC9Ijqg8cJXvWV44nXPBwp7PoSIJDdM3Q1WVJfKYYgU4g6ZAqq0hZCRsmmv7JC8a2HEDgwEP80CdhB5UyZAzZAt67ZBrdXNZBygK3J9RTpJX90JmvNuZBZBIzAgwRX6jZBNxOWoZCJpZBP67ZArup9Qk8902rZBc6ACdhA";



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

app.get('/', function (req, res) {
  res.render('pages/index');
});

async function get_psid(req){
  event = req.body.entry[0].messaging[0]
  sender = event.sender.id
  return sender;
}

async function cadastrar_usuario(psid){
  try {
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query("insert into public.usuario (psid, contexto) values ('"+psid+"','cadastro')", (err, result) => {
      return "usuario_cadatrado_com_sucesso";
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
          console.log(" # Deu erro porque veio vazio #");
        }
        console.log(" # O resultado pode estar vazio #");
        console.log(result.rows)
      })
    })
  } catch (e) {
    console.log(e);
  }
}

async function cadastrar_usuario_completo(psid, num_oab, rf_oab){
  try {
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query("insert into public.usuario (psid, contexto) values ('"+psid+"','cadastro')", (err, result) => {
      return "usuario_cadatrado_com_sucesso";
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
          console.log(" # Deu erro porque veio vazio #");
        }
        console.log(" # O resultado pode estar vazio #");
        console.log(result.rows)
      })
    })
  } catch (e) {
    console.log(e);
  }
}

async function muda_context_usuario(psid, contexto){
  try {
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      let r = client.query("UPDATE public.usuario SET contexto = '"+contexto+"' WHERE psid='"+psid+"'", (err, result) => {
      console.log("#update context"+r);
        return "usuario_cadatrado_com_sucesso";
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
          console.log(" # Deu erro porque veio vazio #");
        }
        console.log(" # O resultado pode estar vazio #");
        console.log(result.rows)
      })
    })
  } catch (e) {
    console.log(e);
  }
}

async function update_name(psid, nome){
  try {
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      let r = client.query("UPDATE public.usuario SET nome = '"+nome+"' WHERE psid='"+psid+"'", (err, result) => {
      console.log("#update context"+r);
        return "usuario_cadatrado_com_sucesso";
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
          console.log(" # Deu erro porque veio vazio #");
        }
        console.log(" # O resultado pode estar vazio #");
        console.log(result.rows)
      })
    })
  } catch (e) {
    console.log(e);
  }
}

async function salva_nome(psid, nome){
  try {
    pool.connect((err, client, release) => {
      if (err) {
        return console.error('Error acquiring client', err.stack)
      }
      client.query("UPDATE public.usuario SET nome = '"+nome+"' WHERE psid= '"+psid+"'", (err, result) => {
      return "nome_salvo_com_sucesso";
        release()
        if (err) {
          return console.error('Error executing query', err.stack)
          console.log(" # Deu erro porque veio vazio #");
        }
        console.log(" # O resultado pode estar vazio #");
        console.log(result.rows)
      })
    })
  } catch (e) {
    console.log(e);
  }
}

app.post('/cadastro', async (req, res)=>{
  console.log("foi pro ff");
  console.log(req.body.queryResult.parameters);
  let nome = req.body.queryResult.parameters.nome; 
  let num_oab = req.body.queryResult.parameters.num_oab;
  let rf_oab = req.body.queryResult.parameters.rf_oab;
  let text_response = "";
  var psid = await get_psid(req);
  console.log("# PSID"+psid);
  let context_nome = getContext(psid);
    if(context_nome == "cadastro"){
      text_response = "Você já possui um cadastro!";
    } else {
      //let cadastrado = await cadastrar_usuario_completo(psid);
      text_response = "Cadastrado com sucesso!";      
    }
 
  return res.json({
    fulfillmentText: text_response,
    source: 'api'
  })
});

app.post('/webhook/', async function (req, res) {
  messaging_events = req.body.entry[0].messaging
  var psid = await get_psid(req);
  for (i = 0; i < messaging_events.length; i++) {
    event = req.body.entry[0].messaging[i]
    sender = event.sender.id
    if (event.message && event.message.text) {
      text = event.message.text

      if (text == "Iniciar acompanhamento" || text == "cd") {
        sendTextMessage(sender, "Primeiro deixa eu ver ser vc já tem um cadastro"); 
        await sleep(300);
        console.log("param " + psid);
        let context = await getContext(psid);
        if(context=="cadastro"){
          sendTextMessage(sender, "Você já tem um cadastro \n "); 
          sendTextMessage(sender, "Seu acompanhamento de processos está ativo");  
        } else  {          
          sendTextMessage(sender, "Você ainda não tem um cadastro, vamos fazer agora");
          let cadastrado =  await cadastrar_usuario(psid);
            sendTextMessage(sender, "Informe seu nome:");
            let m_contexto = await muda_context_usuario(psid, 'cadastro.nome');
            let u_nome = await update_name(text);
            console.log("# contexto(nome):"+m_contexto);         
        }
      } else {
        let context_nome = await getContext(psid);
        if(context_nome == "sem_contexto"){
          sendTextMessage(sender, "Primeiro faça o seu cadastro");
        } else{
          if(context_nome != "cadastro.finalizado"){
            sendTextMessage(sender, "Finalize seu cadastro");
          } else{
            sendTextMessage(sender, "Legal, você já possui um cadastro e seu acompanhamento de processo está ativo!");
          }
        }
        //sendTextMessage(sender, "Estamos em fase de testes: " + text.substring(0, 200))
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

function sleep(ms) {
  return new Promise((resolve) => {
      setTimeout(resolve, ms);
  });
}  

//Porta padrão da aplicação
app.listen(PORT, function () {
  console.log('Second server listening on port 3000!');
});