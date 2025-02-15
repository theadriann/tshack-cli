#!/usr/bin/env node
import { Command } from "commander";
import { handleNewCommand, NewCommandOptions } from "./commands/new.js";
import { handleLiveCommand, LiveCommandOptions } from "./commands/live.js";

const program = new Command();

program.name("tshack").description("⚡ Quick TypeScript playground CLI").version("0.1.1");

program
    .command("new [name]")
    .description("Create a new TypeScript playground or standalone file")
    .option(
        "-t, --template <template>",
        "Choose a template for project creation (basic, express, fullstack)",
        "basic"
    )
    .option("--type <type>", "Type of playground to create (project or file)", "project")
    .option("--editor <editor>", "Override the editor command to use (e.g., code, vim, nano)")
    .option(
        "--packageManager <manager>",
        "Override the package manager to use (e.g., npm, pnpm, yarn)"
    )
    .action((name: string | undefined, options: NewCommandOptions) =>
        handleNewCommand(name, {
            template: options.template,
            type: options.type as "project" | "file",
            editor: options.editor,
            packageManager: options.packageManager,
        })
    );

program
    .command("live [name]")
    .description("Create and run a TypeScript file with live reloading")
    .option("--editor <editor>", "Override the editor command to use (e.g., code, vim, nano)")
    .option(
        "--packageManager <manager>",
        "Override the package manager to use (e.g., npm, pnpm, yarn)"
    )
    .action((name: string | undefined, options: LiveCommandOptions) =>
        handleLiveCommand({
            name,
            editor: options.editor,
            packageManager: options.packageManager,
        })
    );

program.parse(process.argv);
