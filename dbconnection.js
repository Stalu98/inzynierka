const {Pool, Client} = require('pg')
const connectionString = 'postgressql://postgres:Globus12@localhost:5432/postgresdb2'

const client = new Client({
    connectionString:connectionString
})

client.connect()

client.query('SELECT * from rozgrywki ' ,(err,res)=>{
    console.log(err,res)
    client.end()
})