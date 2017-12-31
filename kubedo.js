#!/usr/bin/env node
const Promise   = require('bluebird')
const co        = require('co')
const prompt    = require('co-prompt')
const exec      = Promise.promisify(require('child_process').exec)
const program   = require('commander')
const fs        = require('fs-promise')

let required_args = [
  'do_api_key',
  'base_name',
  'masters_no',
  'machines_no',
  'region',
  'image',
  'size',
  'ssh_key_id',
  'tag',
  'lego_email'
]

program
  .version('0.1.0')
  .option('-C, --chdir <path>', 'change the working directory')
  .option('-c, --config <path>', 'set config path. defaults to ./deploy.cfg')
  .option('-T, --no-tests', 'ignore test hook');


program
 .command('setup [env]')
 .description('run setup commands for all envs')
 .option("-s, --setup_mode [mode]", "Which setup mode to use")
 .action(function(env, options){
   var mode = options.setup_mode || "normal";
   env = env || 'all';
   console.log('setup for %s env(s) with %s mode', env, mode);
 });

program
  .command('deploy')
  .description('Deploy a production ready k8s cluster on DigitalOcean')
  .option('-f, --file <CONFIG_FILE>', 'Your kubedo Configuration File')
  .option('-a, --do_api_key <DO_API_KEY>', 'Your Digital Ocean Api Key')
  .option('-b, --base_name <BASE_NAME>', 'Your cluster base name e.g. snapup-labs')
  .option('-m, --masters_no <MASTERS_NO>', 'Number of k8s Master Nodes')
  .option('-n, --machines_no <MACHINES_NO>', 'The number of Machines to spin up')
  .option('-r, --region <REGION>', 'The region e.g. nyc2')
  .option('-i, --image <IMAGE>', 'The operating system image e.g. ubuntu-16-04-x64')
  .option('-s, --size <SIZE>', 'The machines size e.g. 2GB')
  .option('-k, --ssh_key_id <SSH_KEY_ID>', 'Your Digital Ocean SSH Key ID')
  .option('-t, --tag <TAG>', 'Tag to apply to the machines')
  .option('-l, --lego_email <LEGO_EMAIL>', 'Your main email')
  .option('-gk, --godaddy_api_key <GODADDY_API_KEY>', 'Your GODADDY_API_KEY')
  .option('-gs, --godaddy_api_secret <GODADDY_API_SECRET>', 'Your GODADDY_API_SECRET')
// .action(function(file) {
//   console.log(program)
//   console.log('Hello Kubedo')
//   console.log(file)
// })

program.parse(process.argv)

if(program.file) {
  fs.readFile(`./${program.file}`, 'utf-8')
  .then(file => {
    let keys = file.split('\n').map(line => line.split('=')[0])
    let match = keys.filter(k => required_args.includes(k.toLowerCase()))
    if(!match.length == required_args.length) {
      console.log('Missing required arguments: ', JSON.stringify(required_args.filter(a => match.includes(a)), undefined, 2))
      //prompt for use input
      process.exit(1)
    }
    //decorate with arguments
    //the arguments will have precedence over the options described in the file

    //launch scripts
    exec('./terraform.js')
    //write to target file
    .then((stdin, stderr) => {
      if(stderr)
      console.log(stderr); process.exit(1)
      console.log(stdin)
      return exec('./prepare_nodes.sh')
    })
    .then((stdin, stderr) => {
      if(stderr)
      console.log(stderr); process.exit(1)
      console.log(stdin)
      return exec('./provision_k8s.sh')
    })
    .then((stdin, stderr) => {
      if(stderr)
      console.log(stderr); process.exit(1)
      console.log(stdin)
      return exec('./kubectl_config.sh')
    })
    .then((stdin, stderr) => {
      if(stderr)
      console.log(stderr); process.exit(1)
      console.log(stdin)
      return exec('./helm_tls_ingress.sh')
    })
    .then((stdin, stderr) => {
      if(stderr)
      console.log(stderr); process.exit(1)
      console.log(stdin)
      return exec('./lb_config.js')
    })
    .then((stdin, stderr) => {
      if(stderr)
      console.log(stderr); process.exit(1)
      console.log(stdin)
      return exec('./dns_config.js')
    })
    .catch(err => {
      console.log(err)
      process.exit(1)
    })
  })
  .catch(err => {
    console.log(err)
    process.exit(1)
  })
} else {
  console.log('\n No configuration file nor arguments specified. \n')
  process.exit(1)
  //check all the required arguments
}
