# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.1]

### Added

- New `setup` command for managing configuration
    - Interactive configuration management with prompts
    - Support for setting editor command
    - Support for choosing package manager (npm, pnpm, yarn, bun)
    - Support for setting default workspace path
    - Command-line options for non-interactive usage
    - Preserves existing settings when not modified

## [0.2.0]

### Added

- New `list` command to view all projects and scripts

    - Lists both projects and scripts in the workspace
    - Supports filtering with `--type` option (projects, scripts, or all)
    - Shows clear feedback when no items are found
    - Uses colorful formatting for better readability

- New `delete` command for removing projects

    - Supports deleting a single project by name
    - Interactive multi-select mode when no project name is provided
    - Confirmation prompt before deletion
    - `--force` flag to skip confirmation
    - Safe recursive deletion of project contents

- Package manager create command support

    - Added `--create` option to the `new` command
    - Supports any package manager create command (e.g., `vite`, `next`, etc.)
    - Example: `tshack new my-app --create vite --template react-ts`

- Interactive directory change prompt
    - After creating a new project, prompts to change to project directory
    - Opens a new shell in the project directory if confirmed
    - Handles input buffer clearing to prevent prompt interference
    - Maintains original directory state if declined

### Changed

- Improved error handling across all commands
- Better terminal output formatting
- More consistent command-line interface
