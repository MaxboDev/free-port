#! /usr/bin/env node
const { getArgs, getProcessInfoForPort, printProcessInfo, killProcesses } = require('./utils');

const args = getArgs();

async function checkAndFreePort(port) {
  const processesOnPort = await getProcessInfoForPort(port);
  if(processesOnPort.length === 0) {
    console.log(`🎉 Port ${port} is free`);
    process.exit(0);
  }

  await printProcessInfo(processesOnPort, port);
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  if(args.skipPrompt) {
    await killProcesses(processesOnPort);
  } else {
    await new Promise((resolve) => {
      readline.question(`Would you like to kill ${processesOnPort.length > 1 ? 'them' : 'it'}? (Y/n) `, async (name) => {
        readline.close();
        if(name === 'y' || name === '') {
          await killProcesses(processesOnPort);
          resolve();
        } else {
          process.exit(1)
        }
      });
    });
  }
}

checkAndFreePort(args.port).then(() => {
  process.exit(0);
});
