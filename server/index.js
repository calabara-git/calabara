const http = require('http');
const https = require('https');
const app = require('./server');
const fs = require('fs');
const dotenv = require('dotenv');
const initialize_cron = require('./sys/cron/main')
dotenv.config();
const initialize_discord_bot = require('./discord-bot/deploy-commands.js')



if (!process.env.NODE_ENV) {
    console.log('please pass NODE_ENV. Available options are dev and prod')
}


let key = fs.readFileSync("localhost.key", "utf-8");
let cert = fs.readFileSync("localhost.cert", "utf-8");


var server = http.createServer(app)
var secureServer = https.createServer({ key, cert }, app);

if (process.env.NODE_ENV === 'development') {
    secureServer.listen(3001, () => {
        initialize_discord_bot()
            .then(res => console.log(res))
            .then(console.log('Running at Port 3001'))
            .then(() => secureServer.emit('app_started'))
    })
}

/*
else if (process.env.NODE_ENV === 'test') {
    secureServer.listen(3002, () => {
        console.log('running at port 3002')
        secureServer.emit('app_started')
    })
}
*/

else if (process.env.NODE_ENV === 'production') {
    server.listen(80)
    secureServer.listen(443, () => {
        initialize_discord_bot()
            .then(res => console.log(res))
            .then(console.log('Running at Port 3001'))
            .then(() => secureServer.emit('app_started'))
    })


}

initialize_cron();

module.exports = { server, secureServer }