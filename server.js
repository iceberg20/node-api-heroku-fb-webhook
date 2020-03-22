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

//token da página do TRE-RN
var token = "EAAYxzACKqZAsBAJcnacHvK0Yg7DZA20gsFyKjcaV7cpS1NZBX300oXsGNvYXPjJTYTjVIhSi6tNn9byyicNdgp8G4WxHapt6JE56o8udTtWZAKY6Amr1ayDVwTnDfvcRqSvXS25EEMC5KefMaijOZBouyEnuGcdvIZALRX8K18xtSJqx8dv9zM";

//token da página do teste 2
var token = "EAAoQNGvOt1kBAO4UQuK4KKtpZC9Ijqg8cJXvWV44nXPBwp7PoSIJDdM3Q1WVJfKYYgU4g6ZAqq0hZCRsmmv7JC8a2HEDgwEP80CdhB5UyZAzZAt67ZBrdXNZBygK3J9RTpJX90JmvNuZBZBIzAgwRX6jZBNxOWoZCJpZBP67ZArup9Qk8902rZBc6ACdhA";

app.get('/', function (req, res) {
  res.render('pages/index');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
  let verify_token = req.query['hub.verify_token'];
  if ( verify_token === 'trelabs_sj') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
});

app.get('/advogados_ativos/', async function (req, res) {
  try {
    let cliente = await pool.connect();
    let resultado = await cliente.query("select  from usuario where psid='"+psid+"'");
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

async function get_psid(req){
  event = req.body.entry[0].messaging[0]
  sender = event.sender.id
  return sender;
}

async function cadastrar_usuario_completo(psid, num_oab, id_uf_oab, nome){
  try {
    let cliente = await pool.connect();
    let resultado = await cliente.query("insert into public.usuario (psid, contexto, num_oab, id_uf_oab, nome ) values ('"+psid+"','cad.fin','"+num_oab+"',"+id_uf_oab+",'"+nome+"')");
    console.log("#insert "+resultado);
    return "usuario_cadatrado_com_sucesso";
  } catch (e) {
    console.log("erro_no_insert");
    console.log(e);
    return "erro_no_insert";
  } 
}

app.post('/cadastro', async (req, res)=>{
  console.log("v1");
  let intent_name = req.body.queryResult.intent.displayName;
  if (intent_name == "mudar.num_oab - custom"){
    console.log("o cara quer atualizar o numero da aoab")
  }

  if (intent_name == "usuario.cadastro - custom"){
    console.log("o cara quer ativar o acompanhamento")
  }

  //let psid = req.body.originalDetectIntentRequest.payload.data.sender.id;
  let psid = "3820305377987483";
  console.log("#psid:"+psid);
  console.log(req.body.queryResult.parameters);
  let nome = req.body.queryResult.parameters.nome.name; 
  let num_oab = req.body.queryResult.parameters.num_oab;
  let rf_oab = req.body.queryResult.parameters.rf_oab;
  let text_response = "";

  let context_nome = await getContext(psid);
    if(context_nome != "sem_contexto"){
      console.log("# contexto"+context_nome);
      text_response = "Você já possui um cadastro!";
      
    } else {
      let cadastrado = await cadastrar_usuario_completo(psid, num_oab, rf_oab ,nome);
      console.log("#res insert:"+cadastrado);
      if(cadastrado == "usuario_cadatrado_com_sucesso"){
        text_response = "Cadastrado com sucesso!";
      } else {
        text_response = "Você já possui um cadastro";
      }            
    }
 
  return res.json({
    fulfillmentText: text_response,
    source: 'webhook'
  })
});

function sleep(ms) {
  return new Promise((resolve) => {
      setTimeout(resolve, ms);
  });
}

//Datase testes
app.get('/insert', async (req, res) =>{
  try {
    let cliente = await pool.connect();
    let resultado = await cliente.query("insert into public.usuario (psid, contexto, num_oab, id_uf_oab, nome ) values ('10','cad.fin','6',21,'nome')");
    console.log("# insert"+resultado.rows);
    let tipo = typeof resultado;
    console.log("#tipo"+tipo);
    res.json({ saida: "cadastrado_com_sucesso"});
  } catch (e) {
    res.json(e);
    console.log(e);
    return "erro_no_insert";
  }  
});

app.get('/update', async (req, res) =>{
  let psid = req.query.psid || "3820305377987483";
  let num_oab = req.query.num_oab;

  try {
    let cliente = await pool.connect();
    let resultado = await cliente.query("UPDATE public.usuario SET num_oab = '"+num_oab+"' WHERE psid='"+psid+"';");
    console.log("# update result"+resultado);
    if (resultado.rowCount>0){
      res.json({ result: "Ok", command: resultado.command, rowcount: resultado.rowCount});
    } else {
      res.json({ result: "erro", command: resultado.command, rowcount: resultado.rowCount});
    }
  } catch (e) {
    res.json(e);
    console.log(e);
  }  
});

//Porta padrão da aplicação
app.listen(PORT, function () {
  console.log('Second server listening on port 3000!');
});