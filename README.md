# Node.JS API CookBook




### Http Verbs

app.get('/', (req, res) => { return res.send('Received a GET HTTP method'); });

app.post('/', (req, res) => { return res.send('Received a POST HTTP method'); });

app.put('/', (req, res) => { return res.send('Received a PUT HTTP method'); });

app.delete('/', (req, res) => { return res.send('Received a DELETE HTTP method'); });

// Com método externo
app.get('/tarefas', getTarefas);

var getTarefas = function (req, res){
  var dados = {status: "ok", app: "running"};

  res.send(JSON.stringify(dados));
};
