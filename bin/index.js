#! /usr/bin/env node

const net = require('net');
const yargs = require("yargs");
const { getArgs, getProcessInfoForPort, printProcessInfo, killProcesses } = require('./utils');

const args = getArgs();
if(args === undefined) {
  return;
}

async function checkAndFreePort(port) {
  const processesOnPort = await getProcessInfoForPort(port);
  if(processesOnPort.length === 0) {
    console.log(`🎉 Port ${port} is free`);
    return;
  }

  await printProcessInfo(processesOnPort, port);
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  if(args.skipPrompt) {
    killProcesses(processesOnPort);
  } else {
    readline.question(`Would you like to kill ${processesOnPort.length > 1 ? 'them' : 'it'}? (Y/n) `, name => {
      readline.close();
      if(name === 'y' || name === '') {
        killProcesses(processesOnPort);
      } else {
        process.exit(1)
      }
    });
  }
}

checkAndFreePort(args.port);
