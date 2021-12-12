const {Command, flags} = require('@oclif/command');
const fsPromises = require('fs/promises');
const { exec } = require("child_process");
const path = require('path');

const execPromise = async command => {
  return new Promise(async (resolve, reject) => {
      exec(command, { shell: '/bin/zsh' }, (error, stdout, stderr) => {
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
      process.chdir(`./${name}`);
    }
    await this.createGitIgnoreFile();
    await this.npmInitProject();
    await this.modifyPackageJson();
    await this.createIndexFile();
    await this.createReadme(name);
    await this.gitInit();
  }


  async createGitIgnoreFile() {
    this.log(`Creating git ignore file.`);
    const contentFile = path.join(__dirname, '../gitignoretemplate.txt');
    const workingdir  = process.cwd();
    const gitIgnorePath = path.join(workingdir, '.gitignore');
  
    return await fsPromises.copyFile(contentFile, gitIgnorePath);
  }

  async npmInitProject() {
    this.log(`NPM Initing project.`);
    return await execPromise("npm init -y");
  }

  async createIndexFile() {
    this.log(`Creating blank index file.`);
    return await execPromise("touch index.js");
  }

  async createReadme(name) {
    this.log(`Creating README file.`);
    return await execPromise(`echo "# ${name}" > README.md`);
  }

  async gitInit() {
    await execPromise("git init");
    await execPromise("git add .");
    await execPromise(`git commit -m "Initial Commit"`);
  }

  async modifyPackageJson() {
    const packageFile = await fsPromises.readFile('./package.json');
    const jsonObj = JSON.parse(packageFile);
    jsonObj['type'] = 'module';
    await fsPromises.writeFile('./package.json', JSON.stringify(jsonObj, null, 4), 'utf8');
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
