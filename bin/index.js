#! /usr/bin/env node

const net = require('net');
const yargs = require("yargs");
const { getArgs, checkAndFreePort } = require('./utils');

const args = getArgs();
if(args === undefined) {
  return;
}

checkAndFreePort(args.port);
