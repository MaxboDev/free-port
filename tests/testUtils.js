const util = require('util');
const exec = util.promisify(require('child_process').exec);

module.exports = { logConsoleOutput, killTestDockerContainer };

function logConsoleOutput(process) {
  process.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  process.stderr.on('data', (data) => {
    console.warn(data.toString());
  });
}

async function killTestDockerContainer() {
  try {
    const { stdout: stopOutput, stderr: stopError } = await exec('docker stop test-container');
    // console.log('Stop Docker Container Output:', stopOutput);
    // console.error('Stop Docker Container Error:', stopError);
  } catch (error) {
    // Ignore the error if the container does not exist
    // console.error('Stop Docker Container Error 2:', error);
  }

  try {
    const { stdout: rmOutput, stderr: rmError } = await exec('docker rm test-container');
    // console.log('Remove Docker Container Output:', rmOutput);
    // console.error('Remove Docker Container Error:', rmError);
  } catch (error) {
    // Ignore the error if the container does not exist
    // console.error('Remove Docker Container Error 2:', error);
  }
}
