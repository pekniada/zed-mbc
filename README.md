# MBC for Zed

MBC language support for Zed, ported from the VS Code extension at
https://github.com/vilikng/vscode-mbc.

## Features

- Syntax highlighting for MBC keywords, built-in types, constants, strings, numbers, variables, functions, methods, comments, and operators.
- Zed outline entries for `FUNCTION`, `STATEMENT`, `MODULE`, `TYPE`, and `RECORD` declarations.
- File recognition for `.s4`, `.s4h`, and `.s4m`.
- Comment and bracket configuration for normal editor behavior.

## Install in Zed

1. Open Zed.
2. Open the command palette.
3. Run `zed: install dev extension`.
4. Select this repository folder.

5. Open an `.s4`, `.s4h`, or `.s4m` file.

For sharing, clone https://github.com/bravajak/zed-mbc and install the cloned
folder as a Zed dev extension.

## Development checks

```sh
npm install
npm run generate
npm run parse
npm test
```

The generated parser is intentionally tolerant. MBC syntax varies in real-world
files, so unknown tokens are preserved instead of causing broad parse failures.
