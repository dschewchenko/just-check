import {mkdirSync, rmSync, writeFileSync} from "node:fs";
import {join} from "node:path";
import {spawnSync} from "node:child_process";
import {testPackageJson} from "./test-package.js";

describe("just-check CLI", () => {
  const tempDir = join(__dirname, "temp-test-dir-cli");
  const cliFile = join(__dirname, "..", "dist", "bin.js");

  beforeEach(() => {
    mkdirSync(tempDir, {recursive: true});
    writeFileSync(join(tempDir, "package.json"), JSON.stringify(testPackageJson), {encoding: "utf-8"});
  });

  afterEach(() => {
    rmSync(tempDir, {force: true, recursive: true});
  });

  test("should return missing dependencies when install is not provided",
      () => {
        const result = spawnSync("node", [cliFile, `--path=${tempDir}`], {
          encoding: "utf-8"
        });

        expect(result.stdout).toMatch(new RegExp("^Checking dependencies in .+[/\\\\]temp-test-dir-cli"));
        expect(result.stderr).toContain("Problematic dependencies:");
        expect(result.stderr).toContain("lodash (not installed, should be 4.17.21)");
        expect(result.stderr).toContain("jest (not installed, should be 29.5.0)");
        expect(result.status).toBe(1);

      });

  test("should return no missing dependencies when install is provided", () => {
    const result = spawnSync("node",
        [cliFile, "--install='npm install --legacy-peer-deps'", `--path=${tempDir}`], {
          encoding: "utf-8"
        });

    expect(result.stdout).toMatch(new RegExp("^Checking dependencies in .+[/\\\\]temp-test-dir-cli"));
    expect(result.stdout).toContain("Missing dependencies successfully installed.");
    expect(result.stderr).toBe("");
    expect(result.status).toBe(0);
  });

  test(
      "should return no missing dependencies when only checking devDependencies",
      () => {
        const result = spawnSync("node", [cliFile, "--skip-dev", `--path=${tempDir}`], {
              encoding: "utf-8"
            });

        expect(result.stdout).toMatch(new RegExp("^Checking dependencies in .+[/\\\\]temp-test-dir-cli"));
        expect(result.stderr).toContain("Problematic dependencies:");
        expect(result.stderr).toContain("lodash (not installed, should be 4.17.21)");
        expect(result.status).toBe(1);
      });
});
