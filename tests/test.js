const net = require('net');
const { spawn } = require('child_process');
const waitForExpect = require("wait-for-expect");
const findProcess = require('find-process');
const { logConsoleOutput } = require('./testUtils');

const testPort = 1234;

describe('free-port CLI', () => {
  let serverProcess;

  afterEach(() => {
    serverProcess?.kill();
  });

  it('prints help text and exits when run with no arguments', async () => {
    const freePortProcess = spawn('node', ['bin/index.js'], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });

    let output = '';
    freePortProcess.stderr.on('data', (data) => {
      output += data;
    });

    const exitCode = await new Promise((resolve, reject) => {
      freePortProcess.on('close', resolve);
      freePortProcess.on('error', reject);
    });

    expect(exitCode).toBe(1); // expect the process to exit with code 1
    expect(output).toMatchSnapshot(); // compare the output to a snapshot
  });

  it('exits with code 0 when the specified port is free', async () => {
    const process = spawn('node', ['bin/index.js', '2345']);

    const exitCode = await new Promise((resolve, reject) => {
      process.on('close', resolve);
      process.on('error', reject);
    });

    expect(exitCode).toBe(0);
  });

  it('kills the process on the specified port and exits with code 0 when the user confirms that it should be killed', async () => {
    let serverProcessExited = false;
    let freePortExitCode = null;

    serverProcess = spawn('node', ['-e', `require('net').createServer().listen(${testPort})`]);
    serverProcess.on('exit', () => {
      serverProcessExited = true;
    });

    await waitForExpect(async () => {
      expect(await findProcess('port', testPort)).toHaveLength(1);
    }, 1000);

    const freePortProcess = spawn('node', ['bin/index.js', `${testPort}`], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });
    freePortProcess.on('exit', (code) => {
      freePortExitCode = code;
    });

    let output = '';
    freePortProcess.stdout.on('data', (data) => {
      output += data;
    });

    await waitForExpect(() => {
      expect(output).toMatch(/The following processes are running on port 1234:\n  👾 node: \d+\nWould you like to kill it\? \(Y\/n\) /);
    }, 1000);

    freePortProcess.stdin.write('\n'); // simulate user pressing enter

    await waitForExpect(() => {
      expect(output).toMatch(/.*☠️  Killing node - \d+\r✅ Killed process: node - \d+/);
    }, 2000);

    await waitForExpect(() => {
      expect(serverProcessExited).toBe(true);
    }, 1000);

    await waitForExpect(() => {
      expect(freePortExitCode).toBe(0);
    }, 1000);
  });

  it('kills the process on the specified port and exit with code 0 without prompting when run with the -s flag', async () => {
    let serverProcessExited = false;
    let freePortExitCode = null;

    serverProcess = spawn('node', ['-e', `require('net').createServer().listen(${testPort})`]);
    serverProcess.on('exit', () => {
      serverProcessExited = true;
    });

    serverProcess.on('error', (error) => {
      console.error('Server process error:', error);
    });

    await waitForExpect(async () => {
      expect(await findProcess('port', testPort)).toHaveLength(1);
    }, 1000);

    const freePortProcess = spawn('node', ['bin/index.js', `${testPort}`, '-s'], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });
    freePortProcess.on('exit', (code) => {
      freePortExitCode = code;
    });

    let output = '';
    freePortProcess.stdout.on('data', (data) => {
      output += data;
    });

    freePortProcess.on('error', (error) => {
      console.error('free-port process error:', error);
    });

    await waitForExpect(() => {
      expect(serverProcessExited).toBe(true);
    }, 1000);

    await waitForExpect(() => {
      expect(freePortExitCode).toBe(0);
    }, 1000);
  });

  it('should not kill the process on the specified port and exit with code 1 when the user chooses not to kill the process', async () => {
    let serverProcessExited = false;
    let freePortExitCode = null;

    serverProcess = spawn('node', ['-e', `require('net').createServer().listen(${testPort})`]);
    serverProcess.on('exit', () => {
      serverProcessExited = true;
    });

    await waitForExpect(async () => {
      expect(await findProcess('port', testPort)).toHaveLength(1);
    }, 1000);

    const freePortProcess = spawn('node', ['bin/index.js', `${testPort}`], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc']
    });
    freePortProcess.on('exit', (code) => {
      freePortExitCode = code;
    });

    let output = '';
    freePortProcess.stdout.on('data', (data) => {
      output += data;
    });

    await waitForExpect(() => {
      expect(output).toMatch(/The following processes are running on port 1234:\r?\n  👾 node: \d+\r?\nWould you like to kill it\? \(Y\/n\) /);
    }, 1000);

    freePortProcess.stdin.write('n\n'); // simulate user pressing n and then enter

    await waitForExpect(() => {
      expect(freePortExitCode).toBe(1);
    }, 1000);

    expect(serverProcessExited).toBe(false);
  });
});
