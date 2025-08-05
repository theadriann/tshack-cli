import chalk from "chalk";
import inquirer from "inquirer";
import { ConfigManager } from "../config.js";
import { applyConfigOverrides } from "../utils/config.js";

const configManager = new ConfigManager();

export interface SetupCommandOptions {
    editor?: string;
    packageManager?: string;
    defaultWorkspacePath?: string;
}

/**
 * Handles the setup command functionality
 * @param options Command options for configuration
 */
export async function handleSetupCommand(options: SetupCommandOptions = {}): Promise<void> {
    // Get current config
    const config = configManager.getConfig();

    console.log(chalk.blue("\n📝 Current configuration:"));
    console.log(chalk.green(`  • Editor: ${config.editor.command}`));
    console.log(chalk.green(`  • Package Manager: ${config.packageManager}`));
    console.log(chalk.green(`  • Default Workspace: ${config.defaultWorkspacePath}`));

    // If no options provided, prompt user for changes
    if (!options.editor && !options.packageManager && !options.defaultWorkspacePath) {
        const answers = await inquirer.prompt([
            {
                type: "input",
                name: "editor",
                message: "Enter editor command (leave empty to keep current):",
                default: "",
            },
            {
                type: "list",
                name: "packageManager",
                message: "Choose package manager:",
                choices: [
                    { name: "Keep current", value: "" },
                    { name: "npm", value: "npm" },
                    { name: "pnpm", value: "pnpm" },
                    { name: "yarn", value: "yarn" },
                    { name: "bun", value: "bun" },
                ],
                default: 0,
            },
            {
                type: "input",
                name: "defaultWorkspacePath",
                message: "Enter default workspace path (leave empty to keep current):",
                default: "",
            },
        ]);

        // Only apply non-empty answers
        options = {
            editor: answers.editor || undefined,
            packageManager: answers.packageManager || undefined,
            defaultWorkspacePath: answers.defaultWorkspacePath || undefined,
        };
    }

    // Apply any provided overrides
    applyConfigOverrides(options);

    // Show updated configuration
    const updatedConfig = configManager.getConfig();
    console.log(chalk.blue("\n✨ Updated configuration:"));
    console.log(chalk.green(`  • Editor: ${updatedConfig.editor.command}`));
    console.log(chalk.green(`  • Package Manager: ${updatedConfig.packageManager}`));
    console.log(chalk.green(`  • Default Workspace: ${updatedConfig.defaultWorkspacePath}`));
    console.log();
}
