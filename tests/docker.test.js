const net = require('net');
const { spawn } = require('child_process');
const waitForExpect = require("wait-for-expect");
const { logConsoleOutput, killTestDockerContainer, dockerPullNginx } = require('./testUtils');

const testPort = 1234;

describe('Docker tests', () => {
  let serverProcess;

  beforeAll(async () => {
    await dockerPullNginx();
  }, 10000);

  afterEach(() => {
    serverProcess?.kill();
  });

  beforeEach(async () => {
    await killTestDockerContainer();
  }, 10000)

  afterEach(async () => {
    await killTestDockerContainer();
  }, 10000)

  it('stops a Docker container on the specified port', async () => {
    // Start a Docker container that listens on a specific port
    const container = spawn('docker', ['run', '--name', 'test-container', '-p', '1234:80', '-d', 'nginx']);

    // Wait for the Docker container to start
    await waitForExpect(async () => {
      const dockerPs = spawn('docker', ['ps']);
      let output = '';
      dockerPs.stdout.on('data', (data) => {
        output += data;
      });
      await new Promise((resolve) => dockerPs.on('close', resolve));
      expect(output).toContain('test-container');
    }, 4000);

    // Run your app to stop the Docker container on the specified port
    const freePortProcess = spawn('node', ['bin/index.js', '1234']);
    freePortProcess.on('exit', (code) => {
      freePortExitCode = code;
    });

    let output = '';
    freePortProcess.stdout.on('data', (data) => {
      output += data;
    });

    await waitForExpect(() => {
      expect(output).toMatch(/Port in use by docker, getting container info...\r?\nThe following processes are running on port 1234:\r?\n  📦 test-container: .{12}\r?\nWould you like to kill it\? \(Y\/n\) /);
    }, 4000);

    freePortProcess.stdin.write('y\n'); // simulate user pressing y and then enter

    await waitForExpect(() => {
      expect(output).toContain('✅ Stopped container: test-container -');
    }, 4000);

    // Check if the Docker container is stopped
    await waitForExpect(async () => {
      const dockerPs = spawn('docker', ['ps']);
      let output = '';
      dockerPs.stdout.on('data', (data) => {
        output += data;
      });
      await new Promise((resolve) => dockerPs.on('close', resolve));
      expect(output).not.toContain('your-docker-image');
    }, 2000);

    freePortProcess.kill();
  }, 10000);
});
