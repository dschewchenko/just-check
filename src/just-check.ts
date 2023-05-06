import {spawnSync} from "node:child_process";
import {existsSync, readFileSync} from "node:fs";
import {join, resolve} from "node:path";
import {platform} from "node:os";
import {satisfies} from "semver";

export type Options = {
  /**
   * The command to run to install missing dependencies.
   *
   * @default null. If null, no installation will be performed, only a check. If a string, the string will be run as a command, for example "npm install".
   */
  install?: string,
  /**
   * Whether to check devDependencies as well as dependencies.
   *
   * @default true. If true, devDependencies will be checked, otherwise they will not.
   */
  checkDevDependencies?: boolean,
  /**
   * The path to the project to check.
   *
   * @default "." - current directory
   */
  path?: string,
}

export type MissingDependency = {
  /**
   * The name of the dependency.
   */
  packageName: string,
  /**
   * The version specified in the package.json file.
   */
  specifiedVersion: string,
  /**
   * The version installed in the node_modules folder.
   * If the dependency is not installed, this will be null, otherwise it will be a string containing the installed version.
   */
  installedVersion: string | null,
}

/**
 * Checks if all dependencies are installed and if they satisfy the version requirements.
 *
 * @param options - The options to use for the check.
 * @returns An array of missing dependencies, or null if there are no missing dependencies.
 */
export function justCheck({
  install = null,
  checkDevDependencies = true,
  path = "."
}: Options): MissingDependency[] | null {
  const projectPath = resolve(path);
  const packageJsonFile = join(projectPath, "package.json");

  // check if the package.json file exists
  if (!existsSync(packageJsonFile)) {
    throw new Error(`No package.json file found in ${projectPath}`);
  }

  const packageJson = JSON.parse(readFileSync((packageJsonFile), "utf-8"));

  const dependencies = packageJson.dependencies;

  // if the checkDevDependencies option is set, add the devDependencies to the list of dependencies to check
  if (checkDevDependencies) {
    Object.assign(dependencies, packageJson.devDependencies);
  }

  const missingDependencies = [];

  // check each dependency to see if it is installed and if it satisfies the version requirement
  Object.entries(dependencies).forEach(([packageName, version]) => {
    const packagePath = join(projectPath, "node_modules", packageName,
        "package.json");

    // if the package is not installed, add it to the list of missing dependencies, otherwise check the version
    if (!existsSync(packagePath)) {
      missingDependencies.push(
          {packageName, specifiedVersion: version, installedVersion: null});
    } else {
      const installedPackage = JSON.parse(readFileSync((packagePath), "utf-8"));

      // if the installed version does not satisfy the version requirement, add it to the list of missing dependencies
      if (!satisfies(installedPackage.version, version)) {
        missingDependencies.push({
          packageName,
          specifiedVersion: version,
          installedVersion: installedPackage.version
        });
      }
    }
  });

  // if there are any missing dependencies, print them and optionally install them
  if (missingDependencies.length > 0) {
    // if the install option is set, run the install command
    if (install) {
      console.log("Installing missing dependencies...");
      const [command, ...installArgs] = install.split(" ");
      const installProcess = platform() === "win32" ?
          spawnSync("cmd.exe", ["/c", command, ...installArgs], {
            stdio: "inherit",
            cwd: projectPath
          }) :
          spawnSync(command, installArgs, {
            stdio: "inherit",
            cwd: projectPath
          });

      if (installProcess.status === 0) {
        console.log("Missing dependencies successfully installed.");
        return null;
      } else {
        throw new Error("Failed to install missing dependencies.");
      }
    }

    return missingDependencies;
  }

  // if there are no missing dependencies, return null. All good!
  return null;
}
