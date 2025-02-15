# tshack-cli 🚀

A lightning-fast CLI tool for spinning up TypeScript playgrounds and prototypes. Create, test, and experiment with TypeScript code in seconds.

## Features ✨

- **Quick Project Creation**: Instantly scaffold TypeScript projects with pre-configured templates
- **Standalone Files**: Create single TypeScript files for quick prototyping
- **Live Reloading**: Run TypeScript files with automatic reloading on changes
- **Multiple Templates**: Choose from different project templates (basic, express, fullstack)
- **Editor Integration**: Automatically opens your preferred code editor
- **Package Manager Choice**: Use your preferred package manager (npm, pnpm, yarn)
- **Zero Config**: Works out of the box with sensible defaults
- **Customizable**: Easy to override default settings through configuration

## Installation 🔧

```bash
# Using npm
npm install -g tshack-cli

# Using pnpm
pnpm add -g tshack-cli

# Using yarn
yarn global add tshack-cli
```

## Usage 📖

### Create a New Project

```bash
# Create a new TypeScript project
tshack new my-project

# Create with a specific template
tshack new my-api --template express

# Create with custom editor/package manager
tshack new my-project --editor vim --packageManager yarn
```

### Create a Standalone File

```bash
# Create a single TypeScript file
tshack new script --type file

# Create and run with live reloading
tshack live script
```

### Command Options

#### `new` Command
- `-t, --template <template>` - Choose project template (basic, express, fullstack)
- `--type <type>` - Type of playground (project or file)
- `--editor <editor>` - Override default editor
- `--packageManager <manager>` - Override default package manager

#### `live` Command
- `--editor <editor>` - Override default editor
- `--packageManager <manager>` - Override default package manager

## Configuration 🛠️

Create a `.tshack` file in your home directory to customize default settings:

```json
{
    "editor": {
        "command": "code"
    },
    "packageManager": "pnpm",
    "defaultWorkspacePath": "~/ts-hacks"
}
```

## Development 👨‍💻

```bash
# Clone the repository
git clone https://github.com/theadriann/tshack-cli.git
cd tshack-cli

# Install dependencies
pnpm install

# Build the project
pnpm build

# Watch mode
pnpm dev

# Format code
pnpm format

# Local installation
pnpm local-install
```

## Contributing 🤝

Contributions are welcome! Please feel free to submit a Pull Request.

## License 📄

ISC License 