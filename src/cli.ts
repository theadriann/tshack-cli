#!/usr/bin/env node
import { Command } from "commander";
import { handleNewCommand, NewCommandOptions } from "./commands/new.js";
import { handleLiveCommand, LiveCommandOptions } from "./commands/live.js";
import { handleListCommand, ListCommandOptions } from "./commands/list.js";
import { handleDeleteCommand, DeleteCommandOptions } from "./commands/delete.js";
import { handleSetupCommand, SetupCommandOptions } from "./commands/setup.js";
import { addCommonConfigOptions } from "./utils/config.js";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const packageJson = JSON.parse(fs.readFileSync(path.join(__dirname, "../package.json"), "utf-8"));

const program = new Command();

program
    .name("tshack")
    .description("⚡ Quick TypeScript playground CLI")
    .version(packageJson.version);

addCommonConfigOptions(
    program
        .command("new [name]")
        .description("Create a new TypeScript playground or standalone file")
        .option(
            "-t, --template <template>",
            "Choose a template for project creation (basic, express, fullstack)",
            "basic"
        )
        .option("--type <type>", "Type of playground to create (project or file)", "project")
        .option(
            "--create <command...>",
            "Use a package manager create command (e.g., 'vite client --template react-ts')"
        )
).action((name: string | undefined, options: NewCommandOptions) =>
    handleNewCommand(name, {
        template: options.template,
        type: options.type as "project" | "file",
        editor: options.editor,
        packageManager: options.packageManager,
        create: options.create,
    })
);

addCommonConfigOptions(
    program
        .command("live [name]")
        .description("Create and run a TypeScript file with live reloading")
).action((name: string | undefined, options: LiveCommandOptions) =>
    handleLiveCommand({
        name,
        editor: options.editor,
        packageManager: options.packageManager,
    })
);

program
    .command("list")
    .description("List all projects and scripts in the workspace")
    .option("--type <type>", "Filter by type (projects, scripts, or all)", "all")
    .action((options: ListCommandOptions) => handleListCommand(options));

program
    .command("delete [name]")
    .description("Delete one or more TypeScript projects")
    .option("-f, --force", "Skip confirmation prompt", false)
    .action((name: string | undefined, options: DeleteCommandOptions) =>
        handleDeleteCommand({
            name,
            force: options.force,
        })
    );

program
    .command("setup")
    .description("Configure tshack CLI settings")
    .option("--editor <editor>", "Set the default editor command")
    .option("--packageManager <manager>", "Set the default package manager")
    .option("--defaultWorkspacePath <path>", "Set the default workspace path")
    .action((options: SetupCommandOptions) =>
        handleSetupCommand({
            editor: options.editor,
            packageManager: options.packageManager,
            defaultWorkspacePath: options.defaultWorkspacePath,
        })
    );

program.parse(process.argv);
