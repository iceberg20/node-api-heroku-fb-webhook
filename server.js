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

//Porta padrão da aplicação
app.listen(3000, function (){
	console.log('Second server listening on port 3000!');
});


