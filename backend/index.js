const express = require('express');
const app = express();
app.get('/', (req, res) => res.send('API opérationnelle'));
app.listen(3001, () => console.log('Serveur sur http://localhost:3001'));
