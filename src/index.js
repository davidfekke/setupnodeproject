const {Command, flags} = require('@oclif/command');
const fsPromises = require('fs/promises');
const { exec } = require("child_process");
const path = require('path');

const execPromise = async (command, workdir = process.cwd()) => {
  return new Promise(async (resolve, reject) => {
      exec(command, { shell: '/bin/zsh', cwd: workdir }, (error, stdout, stderr) => {
        if (error) {
          console.log(`error: ${error.message}`);
          reject(`error: ${error.message}`);
        }
        if (stderr) {
          console.log(`stderr: ${stderr}`);
          reject(`stderr: ${stderr}`);
        }
        resolve(`stdout: ${stdout}`);
      });
  });
};

class SetupnodeprojectCommand extends Command {
  async run() {
    const {flags} = this.parse(SetupnodeprojectCommand);
    const name = flags.name || 'node_project';
    if (flags.folder) {
      await this.createFolder(name);
    }
    await this.createGitIgnoreFile();
    await this.npmInitProject();
    await this.createIndexFile();
    await this.createReadme(name);
    await this.gitInit();
  }


  async createGitIgnoreFile() {
    this.log(`Creating git ignore file.`);
    const contentFile = path.join(__dirname, '../gitignoretemplate.txt');
    const {flags} = this.parse(SetupnodeprojectCommand);
    const name = flags.name || 'node_project';
    let workingdir;
    if (flags.folder) {
      workingdir = path.join(process.cwd(), name);
    } else {
      workingdir = process.cwd();
    }
    const gitIgnorePath = path.join(workingdir, '.gitignore');
  
    return await fsPromises.copyFile(contentFile, gitIgnorePath);
  }

  async npmInitProject() {
    this.log(`NPM Initing project.`);
    const {flags} = this.parse(SetupnodeprojectCommand);
    const name = flags.name || 'node_project';
    if (flags.folder) {
      return await execPromise("npm init -y", path.join(process.cwd(), name));
    } 
    return await execPromise("npm init -y");
  }

  async createIndexFile() {
    this.log(`Creating blank index file.`);
    const {flags} = this.parse(SetupnodeprojectCommand);
    const name = flags.name || 'node_project';
    if (flags.folder) {
      return await execPromise("touch index.js", path.join(process.cwd(), name));
    } 
    return await execPromise("touch index.js");
  }

  async createReadme(name) {
    this.log(`Creating README file.`);
    const {flags} = this.parse(SetupnodeprojectCommand);
    if (flags.folder) {
      return await execPromise(`echo "# ${name}" > README.md`, path.join(process.cwd(), name));
    } 
    return await execPromise(`echo "# ${name}" > README.md`);
  }

  async gitInit() {
    const {flags} = this.parse(SetupnodeprojectCommand);
    const name = flags.name || 'node_project';
    if (flags.folder) {
      await execPromise("git init", path.join(process.cwd(), name));
      await execPromise("git add .", path.join(process.cwd(), name));
      await execPromise(`git commit -m "Initial Commit"`, path.join(process.cwd(), name));
    } 
    await execPromise("git init");
    await execPromise("git add .");
    await execPromise(`git commit -m "Initial Commit"`);
  }

  async createFolder(name) {
    await fsPromises.mkdir(name);
  }

}

SetupnodeprojectCommand.description = `Use this command to scaffold out a fresh node project
...
Type in 'snp', and this tool will create a fresh node project 
`

SetupnodeprojectCommand.flags = {
  // add --version flag to show CLI version
  version: flags.version({char: 'v'}),
  // add --help flag to show CLI version
  help: flags.help({char: 'h'}),
  name: flags.string({char: 'n', description: 'name to print'}),
  folder: flags.boolean({char: 'f', description: 'create Folder for project', default: false })
}

module.exports = SetupnodeprojectCommand
