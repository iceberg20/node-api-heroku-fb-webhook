
  console.log(" Pegueio PSID");
  console.log(req);
  console.log("# req fim");
  console.log(req.body);
  console.log("# body fim");
  console.log(req.body.queryResult);
  console.log("# body.queryresult dim");
  console.log(req.body.originalDetectIntentRequest);
  console.log("# req.body.originalDetectIntentRequest fim");
  console.log(req.body.originalDetectIntentRequest.payload);
  console.log("# req.body.originalDetectIntentRequest.payload");
  console.log(req.body.originalDetectIntentRequest.payload.data);
  console.log("# req.body.originalDetectIntentRequest.payload.data fim");
  console.log(req.body.originalDetectIntentRequest.payload.data.sender.id);
  console.log("# req.body.originalDetectIntentRequest.payload.data fim");

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
          console.log("# contexo ="+context);
          if(context=="cadastro"){
            sendTextMessage(sender, "Você já tem um cadastro \n "); 
            sendTextMessage(sender, "Seu acompanhamento de processos está ativo");  
          } else  {          
            sendTextMessage(sender, "Você ainda não tem um cadastro, vamos fazer agora");
            let cadastrado =  await cadastrar_usuario(psid);
              sendTextMessage(sender, "Informe seu nome:");
              let m_contexto = await muda_context_usuario(psid, 'cadastro.nome');
              console.log("# contexto(nome):"+m_contexto);         
          }
        } else {
          let context_nome = await getContext(psid);
          if(context_nome == "cadastro.nome"){
            let cad_nome = await salva_nome(psid, text);
            if(cad_nome == "nome_salvo_com_sucesso"){
              sendTextMessage(sender, "Ok, "+text+" já anotei seu nome");    
              sendTextMessage(sender, "Qual seu número de da OAB? ");          
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

app.get('/debug', (req,res)=>{
    let a = 2;
    let b = 3;
    let sum = a + b;
    res.json({soma:sum});
  });

//promisses
function send_msg(text){
    return new Promisse( (resolve, reject) =>{
      if (text != null){
        sendTextMessage(sender, "Você já tem um cadastro");
        resolver("msg_enviada:"+text);
        console.log("#resolved #")
      } else {
        reject("msg_nao_enviada");
        console.log("#rejected  #")
      }
    })
  }
  
//async await 
app.get('/teste/getcontext', async function (req, res) {
    let psid = req.query.psid;
    console.log("param " + psid);
    let out = await getContext(psid);
    if(out==[]){
  
    }
    console.log("### OUT ###: " + out);
  
    res.send(out);
  });

// API End Point 
app.post('/webhook-off/', function (req, res) {
    console.log("##########################");
    console.log("Entrou no webhook");
    console.log("##########################");
    let opsid = getPSID(req);
    console.log(opsid);
    console.log(getContext(opsid));

    messaging_events = req.body.entry[0].messaging
    for (i = 0; i < messaging_events.length; i++) {
        event = req.body.entry[0].messaging[i];
        psid = event.sender.id;
        console.log("# deu certo #");
        if (event.message && event.message.text) {
            text = event.message.text
            console.log(text);
            if (text == "Iniciar acompanhamento" || text == "cd") {
                sendTextMessage(sender, "Ok, primeiro preciso fazer o seu cadastro");
                sendTextMessage(sender, "Qual o seu nome?");
                let contexto = setContext("cadastro_nome");
                sendTextMessage(sender, contexto);
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


app.post("/webhook_select_intent", function (req, res) {
    var intent_name = req.body.queryResult.intent.displayName;
    var speech = "";
    if (intent_name == "echo") {
        speech = "echo";
    } else if (intent_name == "T004-webhook1") {
        speech = "T004-webhook1";
    } else if (intent_name == "T005-hook") {
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

    return res.json({
        payload: speechResponse,
        //data: speechResponse,
        fulfillmentText: speech,
        speech: speech,
        displayText: speech,
        source: "webhook-echo-sample"
    });
});


//parâmetro e status code 200
app.get('/find_psid/:psid', function (req, res) {
    console.log("aew");
    res.status('200').send({ card: 'card' });
});


//teste db select banco de dados new table usuario
app.get('/db_teste', (req, res) => {
    try {
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
    catch (e) {
        console.log(e);
    }
});

// teste db
app.get('/heroku_db', (req, res) => {
    let saida = "";
    client.connect();
    try {
        client.query('select * from teste_table', (err, res) => {
            if (err) throw err;
            saida = res.rows;
            for (let row of res.rows) {
                console.log(JSON.stringify(row));
            }
            client.end();
        });
    }
    catch (e) {
        console.log(e);
    }
    res.send("string");
});

//version
app.get('/version', (req, res) => {
    return res.send('21');
});

//sleep
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

//usando função sleep
await sleep(1000);