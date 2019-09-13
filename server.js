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

//Inicializando tarefas vazio
var tarefas = new Array();

var escreverArquivo = function(tarefas) {
	fs.writeFile('tarefas.txt', JSON.stringify(tarefas), function (err) {
  		if (err) throw err;
	}); 
};

//Ler aquivo Json
var readFile = function () {
	return JSON.parse(fs.readFileSync('tarefas.txt'));
};

//Adiciona Tarefa ao arquivo Json
var adicionaTarefas = function (req, res){
	var task = {
		"situacao": req.body.situacao,
		"descricao": req.body.descricao,
		"atribuicao": req.body.atribuicao,
		"prazo": req.body.prazo
	};
	tarefas = readFile();
	tarefas.push(task);
	escreverArquivo(tarefas);
	res.send(tarefas);
};

var getTarefas = function (req, res){
	tarefas = readFile();
	res.send(tarefas);
};

//Serviços da API
app.get('/tarefas', getTarefas);
app.post('/tarefas', adicionaTarefas);

//Porta padrão da aplicação
app.listen(3000, function (){
	console.log('Alive listening on port 3000!');
});


