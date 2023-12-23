module.exports = { logConsoleOutput };

function logConsoleOutput(process) {
  process.stdout.on('data', (data) => {
    console.log(data.toString());
  });
  process.stderr.on('data', (data) => {
    console.warn(data.toString());
  });
}
