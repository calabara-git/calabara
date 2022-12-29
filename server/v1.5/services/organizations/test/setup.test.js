const { expect } = require('chai');
const request = require('supertest')
const https = require('https');
const http = require('http');
const express = require('express');
const mockApp = express();
const app = require('../server/server.js')

let userAddress = '0xe9ad38d6E38E0A9970D6ebEc84C73DEA3e025da1'

const initializeServer = () => {

    server = http.createServer(app)
    return server.listen(5050, () => {
        console.log('spinning up a test server')
        server.emit('app_started')

    })
}


const getRequest = async (endpoint) => {
    let response = await request(server)
        .get(endpoint)
        .trustLocalhost()
    return response
}

const postRequest = async (endpoint, body) => {
    let response = await request(server)
        .post(endpoint)
        .send(body)
        .trustLocalhost()
    return response
}

const postWithSession = async (endpoint, body) => {
    let response = await request(server)
        .post(endpoint)
        .set('Cookie', JSON.stringify({ user: { address: userAddress } }))
        .send(body)
        .trustLocalhost()
    return response
}


before(done => {
    initializeServer()
        .on('app_started', () => {
            done();
        })
})

after(done => {
    console.log('exiting test server')
    return server.close(done);
})


module.exports = { getRequest, postRequest, postWithSession }