#!/usr/bin/env node

import {argv, cwd} from "node:process";
import {exit} from "node:process";
import {justCheck} from "./just-check.js";

// get the installation command from the command line arguments
const installArgIndex = argv.findIndex((arg) => arg.startsWith("--install"));
// if the --install argument is present, get the command from it, otherwise use the default
const installCommand = installArgIndex !== -1 ? argv[installArgIndex].split("=")[1]?.replace(/^["']|["']$/g, "") ?? "npm install" : null;

// get the path from the command line arguments
const pathArgIndex = argv.findIndex((arg) => arg.startsWith("--path"));
const path = pathArgIndex !== -1 ? argv[pathArgIndex].split("=")[1]?.replace(/^["']|["']$/g, "") ?? cwd() : cwd();

// get the --skip-dev argument from the command line arguments
const checkDevDependencies = !argv.includes("--skip-dev");

console.log(`Checking dependencies in ${path}...`);

// run the check
try {
  const missingDependencies = justCheck(
      {install: installCommand, checkDevDependencies, path});
  if (missingDependencies) {
    console.error("Problematic dependencies:");

    missingDependencies.forEach(
        ({packageName, specifiedVersion, installedVersion}) => {
          if (installedVersion === null) {
            console.error(
                `- ${packageName} (not installed, should be ${specifiedVersion})`);
          } else {
            console.error(
                `- ${packageName} (installed: ${installedVersion}, should be ${specifiedVersion})`);
          }
        });
    exit(1);
  }
} catch (e) {
  console.error(e.message);
  exit(1);
}
