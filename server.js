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

  res.send(JSON.stringify(dados));
};

//Serviços da API
app.get('/tarefas', getTarefas);

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
  if(request.body.result.parameters['top-rated']) {
      var req = unirest("GET", "https://api.themoviedb.org/3/movie/top_rated");
          req.query({
              "page": "1",
              "language": "en-US",
              "api_key": ""
          });
          req.send("{}");
          req.end(function(res) {
              if(res.error) {
                  response.setHeader('Content-Type', 'application/json');
                  response.send(JSON.stringify({
                      "speech" : "Error. Can you try it again ? ",
                      "displayText" : "Error. Can you try it again ? "
                  }));
              } else if(res.body.results.length > 0) {
                  let result = res.body.results;
                  let output = '';
                  for(let i = 0; i<result.length;i++) {
                      output += result[i].title;
                      output+="\n"
                  }
                  response.setHeader('Content-Type', 'application/json');
                  response.send(JSON.stringify({
                      "speech" : output,
                      "displayText" : output
                  })); 
              }
          });
  }
});


//Porta padrão da aplicação
app.listen(PORT, function (){
	console.log('Second server listening on port 3000!');
});


