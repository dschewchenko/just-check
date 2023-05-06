import {execSync} from "node:child_process";
import {join} from "node:path";
import {mkdirSync, rmSync, writeFileSync} from "node:fs";
import {justCheck, MissingDependency} from "../dist/index.js";
import {testPackageJson} from "./test-package.js";

describe("justCheck", () => {
  const testDirname = "temp-test-dir-function";
  const tempDir = join(__dirname, testDirname);

  beforeEach(() => {
    mkdirSync(tempDir, {recursive: true});
    writeFileSync(join(tempDir, "package.json"), JSON.stringify(testPackageJson), {encoding: "utf-8"});
  });

  afterEach(() => {
    rmSync(tempDir, {force: true, recursive: true});
  });

  test("should return missing dependencies when install is not provided",
      async () => {
        const missingDependencies = justCheck({path: tempDir});

        const expectedMissingDependencies: MissingDependency[] = [
          {packageName: "lodash", specifiedVersion: "4.17.21", installedVersion: null},
          {packageName: "jest", specifiedVersion: "29.5.0", installedVersion: null}
        ];

        expect(missingDependencies).toEqual(expectedMissingDependencies);
      });

  test("should not return missing dependencies when install is provided",
      async () => {
        const result = justCheck({install: "npm install --legacy-peer-deps", path: tempDir});

        expect(result).toBeNull();
      });

  test("should return mismatched dependencies when version is not satisfied",
      async () => {
        execSync("npm install --legacy-peer-deps --no-save lodash@4.17.20 jest@26.0.0", {cwd: tempDir});
        const result = justCheck({path: tempDir});

        expect(result).toHaveLength(2);
        expect(result).
            toContainEqual({
              packageName: "lodash",
              specifiedVersion: "4.17.21",
              installedVersion: "4.17.20"
            });
        expect(result).
            toContainEqual({
              packageName: "jest",
              specifiedVersion: "29.5.0",
              installedVersion: "26.0.0"
            });
      });

  test("should not check devDependencies when checkDevDependencies is false",
      async () => {
        execSync("npm uninstall jest");
        const result = justCheck({checkDevDependencies: false, path: tempDir});
        expect(result).toHaveLength(1);
        expect(result).
            toContainEqual({
              packageName: "lodash",
              specifiedVersion: "4.17.21",
              installedVersion: null
            });
      });
});