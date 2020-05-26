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
var { token_tre, token_pagina_teste2 } = require('./token');

// Version 12
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

//token da página do teste 2
var token = token_pagina_teste2;

app.get('/', function (req, res) {
  res.render('pages/index');
});

// for Facebook verification
app.get('/webhook/', function (req, res) {
  let verify_token = req.query['hub.verify_token'];
  if (verify_token === 'trelabs_sj') {
    res.send(req.query['hub.challenge'])
  }
  res.send('Error, wrong token')
});

app.post('/despachar', function (req, res) {
  let processos = req.body;
  console.log(req.body);
  despachar_fb(processos);
  res.send("despachado");
});

app.post('/despachar_api', function (req, res) {
  let usuarios = req.body.usuarios;
  let produto = req.body.produto;
  let operacao = req.body.operacao;
  let qtd = req.body.qtd;
  let api_key = req.body.api_key;

  console.log(req.body);
  despachar_fb_api(usuarios, produto, operacao, qtd, api_key);
  res.send("despachado");
});

async function despachar_fb(processos) {
  for (const [idx, processo] of processos.entries()) {
    let psid = await buscar_psid_por_oab(processo.usuario.num_oab, processo.usuario.id_uf_oab);
    let qtd = processo.usuario.processos.length;
    let reposta_1 = `Olá, você tem ${qtd} processos atualizados. `;
    sendTextMessage(psid, reposta_1);

    console.log(processo);
    let mensagem = await montar_resposta_fb(processo);
    sendTextMessage(psid, mensagem);
  }
}

async function despachar_fb_api(usuarios, produto, operacao, qtd, api_key) {
    for (const [idx, usuario] of usuarios.entries()) {
    let psid = await buscar_psid_usuarios_estoque(api_key);
    let reposta_1 = `Olá, ${qtd} ${operacao} . `;
    console.log(reposta_1);
    sendTextMessage(psid, reposta_1);
  }
}

async function montar_resposta_fb(usuario) {
  let resposta = await montar_text_processos(usuario);
  return resposta;
}

async function montar_text_processos(usuario) {
  let resposta = "";
  let qtd = usuario.usuario.processos.length;
  let lista = usuario.usuario.processos;

  for (const [idx, processo] of lista.entries()) {
    resposta += `Processo:${processo.id_processo_trf} foi movimentado e se encontra na situação: ${processo.ds_ultimo_movimento} - `;
  }
  return resposta;
}

async function buscar_psid_por_oab(num_oab, id_uf_oab) {
  try {
    let cliente = await pool.connect();
    var resultado = await cliente.query("select psid from usuario where num_oab='" + num_oab + "' and id_uf_oab=" + id_uf_oab + ";");
  } catch (e) {
    console.log(e);
  }
  return resultado.rows[0].psid;
}

async function buscar_psid_usuarios_estoque(api_key) {
  try {
    let cliente = await pool.connect();
    var resultado = await cliente.query(`select psid from usuario_estoque where api_key='${api_key}';`);
  } catch (e) {
    console.log(e);
  }
  return resultado.rows[0].psid;
}

app.get('/usuarios_db_ativos/', async function (req, res) {
  try {
    let cliente = await pool.connect();
    var resultado = await cliente.query("select nome, num_oab, id_uf_oab from usuario;");
  } catch (e) {
    console.log(e);
  }

  let out;
  if (resultado.rowCount > 0) {
    out = { status: "ok", usuarios: resultado.rows };
  } else {
    out = { status: "ok", usuarios: "nem uma usuario ativo" };
  }

  res.json(out);
});

app.get('/usuarios_api_ativos/', async function (req, res) {
  try {
    let cliente = await pool.connect();
    var resultado = await cliente.query("select psid, nome from usuario_estoque;");
  } catch (e) {
    console.log(e);
  }

  let out;
  if (resultado.rowCount > 0) {
    out = { status: "ok", usuarios: resultado.rows };
  } else {
    out = { status: "ok", usuarios: "nem uma usuario ativo" };
  }

  res.json(out);
});

async function getContext(psid) {
  try {
    let cliente = await pool.connect();
    let resultado = await cliente.query("select contexto from usuario where psid='" + psid + "'");
    let contexto = "";
    if (resultado.rowCount > 0) {
      if (contexto = resultado.rows[0].contexto) {
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

async function cadastrar_usuario_completo(psid, num_oab, id_uf_oab, nome) {
  try {
    let cliente = await pool.connect();
    let resultado = await cliente.query("insert into public.usuario (psid, contexto, num_oab, id_uf_oab, nome ) values ('" + psid + "','cad.fin','" + num_oab + "'," + id_uf_oab + ",'" + nome + "')");
    console.log("#insert " + resultado);
    return "usuario_cadatrado_com_sucesso";
  } catch (e) {
    console.log("erro_no_insert");
    console.log(e);
    return "erro_no_insert";
  }
}

async function cadastrar_usuario_da_api( psid, nome, cod_conf ) {
  try {
    let cliente = await pool.connect();
    let resultado = await cliente.query(`insert into public.usuario_estoque ( psid, nome, api_key ) values ( ${psid}, ${nome}, ${cod_conf} );`);
    console.log("#insert " + resultado);
    return "usuario_cadatrado_com_sucesso";
  } catch (e) {
    console.log("erro_no_insert");
    console.log(e);
    return "erro_no_insert";
  }
}

async function cadastro_usuario_da_api(psid, params){
  let nome = params.nome;
  let cod_conf = params.cod_conf;

  console.log("o usuário quer ativar o acompanhamento");
  await cadastrar_usuario_da_api(psid, nome, cod_conf);
  console.log("# Usuário da APi cadastrado com suceosso! #");

}

app.post('/cadastro', async (req, res) => {
  console.log("Req");
  console.log(req);
  console.log("# PSID #");
  req.body.queryResult.fulfillmentMessages
  return res.status(200).send({ status: "ok" });
});

app.post('/cadastro_old', async (req, res) => {
  console.log("v4");

  let intent_name = req.body.queryResult.intent.displayName;
  let params = req.body.queryResult.parameters;


  //Cadastro de Usuário da API
  if (intent_name == "usuario.cadastro.estoque - custom") {
    await cadastro_usuario_da_api(psid, params);  
  }   

  console.log(intent_name);

  if (intent_name == "usuario.cadastro - custom") {
    console.log("o usuário quer ativar o acompanhamento do estoque");
  }

  
  //let psid = "3820305377987483";
  console.log("#psid:" + psid);

  console.log(req.body.queryResult.parameters);
  let nome = req.body.queryResult.parameters.nome.name;
  let num_oab = req.body.queryResult.parameters.num_oab;
  let rf_oab = req.body.queryResult.parameters.rf_oab;
  let text_response = "";

  let context_nome = await getContext(psid);
  if (context_nome != "sem_contexto") {
    console.log("# contexto" + context_nome);
    text_response = "Você já possui um cadastro!";

  } else {
    let cadastrado = await cadastrar_usuario_completo(psid, num_oab, rf_oab, nome);
    console.log("#res insert:" + cadastrado);
    if (cadastrado == "usuario_cadatrado_com_sucesso") {
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
app.get('/insert', async (req, res) => {
  try {
    let cliente = await pool.connect();
    let resultado = await cliente.query("insert into public.usuario (psid, contexto, num_oab, id_uf_oab, nome ) values ('10','cad.fin','6',21,'nome')");
    console.log("# insert" + resultado.rows);
    let tipo = typeof resultado;
    console.log("#tipo" + tipo);
    res.json({ saida: "cadastrado_com_sucesso" });
  } catch (e) {
    res.json(e);
    console.log(e);
    return "erro_no_insert";
  }
});


app.get('/update', async (req, res) => {
  let psid = req.query.psid || "3820305377987483";
  let num_oab = req.query.num_oab;

  try {
    let cliente = await pool.connect();
    let resultado = await cliente.query("UPDATE public.usuario SET num_oab = '" + num_oab + "' WHERE psid='" + psid + "';");
    console.log("# update result" + resultado);
    if (resultado.rowCount > 0) {
      res.json({ result: "Ok", command: resultado.command, rowcount: resultado.rowCount });
    } else {
      res.json({ result: "erro", command: resultado.command, rowcount: resultado.rowCount });
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
