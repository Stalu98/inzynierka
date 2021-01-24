//Imports
const express = require('express')
const app = express()
const port = 3000

//Static files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/js', express.static(__dirname + 'public/js'))
app.use('/img', express.static(__dirname + 'public/img'))

app.get('', (req, res) => {
    res.sendFile(__dirname + '/views/index.html')
})

app.get('/:league', (req, res) => {
    const league = req.params.league
    res.sendFile(__dirname + `/views/${league}.html`)
})






//Listen on port 3000
app.listen(port, () => console.info(`Listening on http://localhost:${port}`))
