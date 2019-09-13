//Config Express
var express = require('express');
var bodyParser = require('body-parser');
var cors = require('cors');
var fs = require('fs');


//App init
var app = express();
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());
app.use(cors()); 

var getTarefas = function (req, res){
  var dados = {status: "ok", app: "running"};

  res.send(JSON.stringify(dados));
};

//Serviços da API
app.get('/tarefas', getTarefas);

//Porta padrão da aplicação
app.listen(3000, function (){
	console.log('Alive listening on port 3000!');
});


