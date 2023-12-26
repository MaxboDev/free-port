const findProcess = require('find-process');
const yargs = require("yargs");
const { exec } = require('child_process');

let spinnerRef;

async function killProcesses(processes) {
  for(const proc of processes) {
    if(!proc.containers) {
      killProcess(proc);
      continue;
    }

    for(container of proc.containers) {
      process.stdout.write(`  ☠️  Killing container ${container.name} - ${container.id}`);
      startSpinner();
      try {
        const result = await killDockerContainer(container);
        stopSpinner();
        if(result) {
          process.stdout.write(`\r✅ Stopped container: ${container.name} - ${container.id}\n`);
        } else {
          process.stdout.write(`\r❌ Failed to stop container: ${container.name} - ${container.pid}\n`);
        }
      } catch(err) {
        stopSpinner();
        process.stdout.write(`\r❌ Failed to stop container: ${proc.name} - ${proc.pid}: ${err}\n`);
      }
    }
  }
}

function killProcess(proc) {
  process.stdout.write(`☠️  Killing ${proc.name} - ${proc.pid}`);
  try {
    process.kill(proc.pid);
    process.stdout.write(`\r✅ Killed process: ${proc.name} - ${proc.pid}\n`);
  } catch (err) {
    process.stdout.write(`\r❌ Failed to kill process: ${proc.name} - ${proc.pid}: ${err}\n`);
  }
}

function killDockerContainer(container) {
  return new Promise((resolve, reject) => {
    const cmd = `docker stop ${container.id}`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
        return;
      }
      if (stderr) {
        resolve(false);
        return;
      }

      resolve(true);
    });
  });
}

function getArgs() {
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
    .option("s", { alias: 'skipPrompt', describe: "Don't prompt before killing the process on the requested port", type: "boolean", demandOption: false })
    .help(true)
    .argv;

  return options;
}

async function getProcessInfoForPort(port) {
  const processes = await findProcess('port', port);

  const mappedProcesses = processes.map(async process => ({
    pid: process.pid,
    name: process.name,
    containers: process.name.startsWith('Docker') ? await getDockerContainersUsingPort(port) : undefined,
  }));

  return await Promise.all(mappedProcesses);
}

function getDockerContainersUsingPort(port) {
  console.log('Port in use by docker, getting container info...');
  return new Promise((resolve, reject) => {
    // Command to list all running containers with their ports and names
    const cmd = `docker ps --format "{{.ID}} {{.Names}} {{.Ports}}"`;

    exec(cmd, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${error}`);
        return;
      }
      if (stderr) {
        reject(`Stderr: ${stderr}`);
        return;
      }

      const containers = [];
      const lines = stdout.trim().split('\n');

      lines.forEach((line) => {
        if (line.includes(`:${port}->`)) {
          const parts = line.split(' ');
          containers.push({
            id: parts[0],
            name: parts[1],
          });
        }
      });

      resolve(containers);
    });
  });
}

function hideCursor() {
  process.stdout.write('\x1B[?25l'); // ANSI escape code to hide the cursor
}

function showCursor() {
  process.stdout.write('\x1B[?25h'); // ANSI escape code to show the cursor
}

function startSpinner() {
  const spinnerChars = ['|', '/', '-', '\\'];
  let spinnerIndex = 0;

  hideCursor();
  spinnerRef = setInterval(() => {
    process.stdout.write(`\r${spinnerChars[spinnerIndex]}`);
    spinnerIndex = (spinnerIndex + 1) % spinnerChars.length;
  }, 100); // Adjust the speed of the spinner by changing the interval time
}

function stopSpinner() {
  if(!spinnerRef) return;
  showCursor();
  clearInterval(spinnerRef);
}

async function printProcessInfo(processes, port) {
  console.log(`The following processes are running on port ${port}:`);
  for (const process of processes) {
    if(process.containers) {
      process.containers.forEach((container) => {
        console.log(`  📦 ${container.name}: ${container.id}`);
      });
      continue;
    }

    console.log(`  👾 ${process.name}: ${process.pid}`);
  }
}

module.exports = { getProcessInfoForPort, printProcessInfo, getArgs, killProcesses };
