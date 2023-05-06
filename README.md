# just-check

Check installed dependencies and their versions in your Node.js project. Will exit with code 1 if any problems are found, otherwise will exit with code 0.

This package helps you to identify missing packages and packages with incorrect versions specified in your `package.json`. It also provides an option to automatically install missing packages.

## Installation

You can install this package as a global package or as a local dependency in your project.

globally:
```bash
npm install just-check -g
```

or locally:

```bash
npm install just-check -D
```

## Usage

### CLI

To use this package as a CLI, run the following command:

```bash
just-check [--install[="your-install-command"]] [--skip-dev] [--path="your-project-path"]
```

If you installed the package, you can add it to your `package.json` scripts, like this:

```json
"scripts": {
  "check-deps": "just-check --install"
}
```

or before starting your project:

```json
"scripts": {
  "start": "just-check --install && node index.js"
}
```

### API (ESM only)

To use this package as an API, you can import it like this:

```js
import { justCheck } from "just-check";

try {
  const missingDeps = justCheck({
    install: "npm install", // command to install missing dependencies, defaults to not installing
    skipDev: true, // skip dev dependencies, defaults to false
    path: "." // path to project root, defaults to process.cwd()
  });
  
  if (missingDeps) {
    console.error("Missing dependencies found!");
    process.exit(1);
  }
} catch (error) {
  console.error(error);
}
```

## Options

- `--install[="your-install-command"]` If this flag is provided, the script will attempt to install missing dependencies using the specified command. If no command is provided, it will default to `npm install`. If you want to use `yarn`, you can specify it like this: `--install="yarn add"`.

- `--skip-dev` If this flag is provided, the script will not check for missing dev dependencies.

- `--path="your-project-path"` If this flag is provided, the script will check for missing dependencies in the specified path. If no path is provided, it will default to `process.cwd()`.

## Example output

```bash
$ just-check
Checking dependencies in .../some-project
Problematic dependencies:
- package1 (installed: 0.9.0, should be 1.0.0)
- package2 (installed: 2.0.5, should be 2.1.0)
- package3 (not installed, should be 1.2.3)
- package4 (not installed, should be 0.8.1)
```

## License

MIT
