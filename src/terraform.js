#!/usr/bin/env node
require('dotenv').load()
/**
 * CREATES AND CONFIGURES DO MACHINES TO HOST A K8S CLUSTER
 */
const DigitalOcean = require('do-wrapper')
const fs           = require('fs')

const api = new DigitalOcean(process.env.DO_API_KEY)
const ssh_keys = [ process.env.SSH_KEY_ID ]

const Config = (name) => ({
  "name": name,
  "region": process.env.REGION,
  "size": process.env.SIZE,
  "image": process.env.IMAGE,
  "ssh_keys": ssh_keys,
  "backups": false,
  "ipv6": true,
  "user_data": null,
  "private_networking": null,
  "volumes": null,
  "tags": [
    process.env.TAG
  ]
})

let promises = []
for(i=0;i < process.env.MACHINES_NO;++i) {
  let name = process.env.BASE_NAME + (i+1 <= process.env.MASTERS_NO ? `-master` : `-worker-${i+1 - process.env.MASTERS_NO}`)
  let config = Config(name)
  console.log(config)
  promises.push(api.dropletsCreate(config))
}
Promise.all(promises).then(resp => {
  console.log(resp) //write the response to file with droplets ids
})
.catch(err => {
  console.log(err)
})
