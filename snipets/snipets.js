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
              if ( text == "Iniciar acompanhamento" || text == "cd") {
                sendTextMessage(sender, "Ok, primeiro preciso fazer o seu cadastro");
                sendTextMessage(sender, "Qual o seu nome?");
                let contexto = setContext("cadastro_nome");
                sendTextMessage(sender, contexto);
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
    
    return res.json({
      payload: speechResponse,
      //data: speechResponse,
      fulfillmentText: speech,
      speech: speech,
      displayText: speech,
      source: "webhook-echo-sample"
    });
  });