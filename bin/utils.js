const findProcess = require('find-process');
const yargs = require("yargs");

const getArgs = () => {
  const usage = "\nUsage: free-port <port> [options]";
  const options = yargs
    .usage(usage)
    .command('$0 <port>', 'the default command', (yargs) => {
      return yargs.positional('port', {
        describe: 'The port to free e.g. 3000',
        type: 'number',
        demandOption: true,
      });
    })
    .option("s", { alias: "skip-prompt", describe: "Don't prompt before killing the process on the requested port", type: "boolean", demandOption: false })
    .help(true)
    .argv;

  if(options.port === null) {
    showHelp();
    return undefined;
  }

  return options;
}

const showHelp = () => {
  yargs.showHelp();
}

const checkAndFreePort = async (port) => {
  const processesOnPort = await getProcessInfoForPort(port);
  if(processesOnPort.length === 0) {
    console.log(`🎉 Port ${port} is free`);
    return;
  }

  console.log(`The following processes are running on port ${port}:`);
  printProcessInfo(processesOnPort);
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
  });

  readline.question('Would you like to kill them? (y/n) ', name => {
    readline.close();
    if(name === 'y') {
      processesOnPort.forEach(proc => {
        process.stdout.write(`☠️  Killing ${proc.name} - ${proc.pid}`);
        try {
          process.kill(proc.pid);
          process.stdout.write(`\r✅ Killed ${proc.name} - ${proc.pid}\n`);
        } catch (err) {
          process.stdout.write(`\r❌ Failed to kill ${proc.name} - ${proc.pid}: ${err}\n`);
        }
      });
    }
  });
}

const getProcessInfoForPort = async (port) => {
  const processes = await findProcess('port', port);
  return processes.map(process => ({
    pid: process.pid,
    name: process.name,
  }));
}

const printProcessInfo = (processes) => {
  processes.forEach(process => {
    console.log(`  - ${process.name}: ${process.pid}`);
  });
}

module.exports = { getProcessInfoForPort, printProcessInfo, getArgs, showHelp, checkAndFreePort };
