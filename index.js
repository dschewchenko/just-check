#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const semver = require('semver');
const { spawn } = require('child_process');

function checkInstalledDependencies(installCommand) {
  const projectPath = path.resolve('.');
  const packageJson = require(path.join(projectPath, 'package.json'));

  const dependencies = packageJson.dependencies;
  const missingDependencies = [];

  // check each dependency to see if it is installed and if it satisfies the version requirement
  Object.entries(dependencies).forEach(([packageName, version]) => {
    const packagePath = path.join(projectPath, 'node_modules', packageName, 'package.json');

    // if the package is not installed, add it to the list of missing dependencies, otherwise check the version
    if (!fs.existsSync(packagePath)) {
      missingDependencies.push({ packageName, specifiedVersion: version, installedVersion: null });
    } else {
      const installedPackage = require(packagePath);

      // if the installed version does not satisfy the version requirement, add it to the list of missing dependencies
      if (!semver.satisfies(installedPackage.version, version)) {
        missingDependencies.push({
          packageName,
          specifiedVersion: version,
          installedVersion: installedPackage.version,
        });
      }
    }
  });

  // if there are any missing dependencies, print them and optionally install them
  if (missingDependencies.length > 0) {
    console.error('Problematic dependencies:');

    missingDependencies.forEach(({ packageName, specifiedVersion, installedVersion }) => {
      if (installedVersion === null) {
        console.error(`- ${packageName} (not installed, should be ${specifiedVersion})`);
      } else {
        console.error(`- ${packageName} (installed: ${installedVersion}, should be ${specifiedVersion})`);
      }
    });

    // if the --install argument is present, run the install command
    if (installCommand) {
      console.log('Installing missing dependencies...');
      const [command, ...installArgs] = installCommand.split(' ');
      const installProcess = spawn(command, installArgs, {
        stdio: 'inherit',
      });

      installProcess.on('exit', (code) => {
        if (code === 0) {
          console.log('Missing dependencies successfully installed.');
        } else {
          console.error('Failed to install missing dependencies.');
          process.exit(1);
        }
      });
    } else {
      process.exit(1);
    }
  } else {
    console.log('All dependencies are installed.');
  }
}

// get the installation command from the command line arguments
const installArgIndex = process.argv.findIndex((arg) => arg.startsWith('--install'));
// if the --install argument is present, get the command from it, otherwise use the default
const installCommand = installArgIndex !== -1 ? process.argv[installArgIndex].split('=')[1] ?? "npm install" : null;

// run the check
checkInstalledDependencies(installCommand);
