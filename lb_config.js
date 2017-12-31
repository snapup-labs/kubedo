#!/usr/bin/env node
require('dotenv').load()
/**
* CONFIGURES DO LOAD BALANCER
*/
const exec = require('child_process').exec
const axios = require('axios')
const fs  = require('fs')
const API = "https://api.digitalocean.com/v2"
const targets = fs.readFileSync('./targets.cfg', 'utf-8').split('\n')

axios.defaults.headers['Authorization'] = `Bearer ${process.env.DO_API_KEY}`

exec(`kubectl get svc -o json | jq -r '.items[] | [.metadata.name,([.spec.ports[].nodePort | tostring ] | join("|"))] | @csv' | grep nginx-ingress-controller`,
function(error, stdout, stderr) {
  if(error) {
    console.log(error)
    process.exit(1)
  }
  if(stderr) {
    console.log(error)
    process.exit(1)
  }

  k8s_target_port_80 = stdout.split(',')[1].split('|')[0].replace('"', '')
  k8s_target_port_443 = stdout.split(',')[1].split('|')[1].replace('"', '')

  const Lb = () => ({
    "name": `${process.env.BASE_NAME}-lb`,
    "region": "nyc3",
    "forwarding_rules": [
      {
        "entry_protocol": "http",
        "entry_port": 80,
        "target_protocol": "http",
        "target_port": k8s_target_port_80,
        "certificate_id": "",
        "tls_passthrough": false
      },
      {
        "entry_protocol": "https",
        "entry_port": 443,
        "target_protocol": "https",
        "target_port": k8s_target_port_443,
        "tls_passthrough": true
      }
    ],
    "health_check": {
      "protocol": "http",
      "port": 80,
      "path": "/",
      "check_interval_seconds": 10,
      "response_timeout_seconds": 5,
      "healthy_threshold": 5,
      "unhealthy_threshold": 3
    },
    "sticky_sessions": {
      "type": "none"
    },
    "tag": process.env.TAG
  })

  axios.post(`${API}/load_balancers`, Lb())
  .then(resp => {
    console.log(resp.data)
    process.exit(0)
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
})
