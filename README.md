![Windows Workflow Status](https://img.shields.io/github/actions/workflow/status/MaxboDev/free-port/ci.yml?logo=windows&label=Windows)
![macOS Workflow Status](https://img.shields.io/github/actions/workflow/status/MaxboDev/free-port/ci.yml?logo=apple&label=macOS)
![Ubuntu Workflow Status](https://img.shields.io/github/actions/workflow/status/MaxboDev/free-port/ci.yml?logo=ubuntu&label=Ubuntu)

# free-port
A simple utility to free a port prior to use, optionally prompting before stopping the process.

If it finds that the port is being used by Docker it will stop the container using the port rather than stopping the whole Docker process and killing all your containers with it.

Its particularly useful to add this to your npm scripts before starting a server on a specific port. This will allow you to stop the process thats preventing this one from starting without having to go and find it.

# Usage
`free-port <port> [options]`

# Options
### -s, --skipPrompt
Don't prompt before killing the process on the requested port.

# Examples
### Free port 3000 - prompt before killing processes
`free-port 3000`

### Free port 3000 - don't prompt before killing processes
`free-port 3000 -s`

### Add before starting a web server in your package.json
`free-port 3000 && start-server 3000`
