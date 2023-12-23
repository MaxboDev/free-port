const { spawn } = require('child_process');
const { logConsoleOutput } = require('./testUtils');

describe('free-port CLI', () => {
  it('should exit with code 0 when the specified port is free', async () => {
    const freePort = 1234;

    const process = spawn('node', ['bin/index.js', `${freePort}`]);

    const exitCode = await new Promise((resolve, reject) => {
      process.on('close', resolve);
      process.on('error', reject);
    });

    expect(exitCode).toBe(0);
  });
});
