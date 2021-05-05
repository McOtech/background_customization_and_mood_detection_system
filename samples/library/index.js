const express = require('express')

const app = express()

app.use(express.static(__dirname +  "/public"));

app.get('/', (req, res) => {
    res.render('index.html');
})

app.listen(3000, () => {
    console.log('Server started on port: 3000');
})