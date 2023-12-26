const os = require('os');

if (os.platform() === 'win32') {
  process.stdout.write('test:win');
} else if (os.platform() === 'darwin') {
  process.stdout.write('test:mac');
} else {
  process.stdout.write('test:nix');
}
