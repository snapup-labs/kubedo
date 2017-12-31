#!/usr/bin/env node
require('dotenv').load()
/**
 * DESTROYS NODES WITH GIVEN IP FOUND IN target.cfg
 */
const axios = require('axios')
const fs  = require('fs')
const API = "https://api.digitalocean.com/v2"
const targets = fs.readFileSync('./targets.cfg', 'utf-8').split('\n')

axios.defaults.headers['Authorization'] = `Bearer ${process.env.DO_API_KEY}`

axios.get(`${API}/droplets`)
.then(resp => {
  return Promise.all(
    resp.data.droplets.filter(droplet => targets.indexOf(droplet.networks.v4[0].ip_address) > 0)
    .map(droplet => axios.delete(`${API}/droplets/${droplet.id}`))
  )
})
.then(digests => {
  digests.map(digest => {
    console.log(digest)
  })
})
.catch(err => {
  console.log(err)
})
