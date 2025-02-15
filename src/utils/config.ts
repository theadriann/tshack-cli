import { ConfigManager } from "../config.js";
import { Command } from "commander";

const configManager = new ConfigManager();

export interface ConfigOverrides {
    editor?: string;
    packageManager?: string;
}

/**
 * Applies any provided config overrides from command options
 */
export function applyConfigOverrides(options: ConfigOverrides) {
    if (options.editor) {
        configManager.getConfig().editor.command = options.editor;
    }

    if (options.packageManager) {
        configManager.getConfig().packageManager = options.packageManager;
    }
}

/**
 * Adds common configuration options to a command
 */
export function addCommonConfigOptions(command: Command): Command {
    return command
        .option("--editor <editor>", "Override the editor command to use (e.g., code, vim, nano)")
        .option(
            "--packageManager <manager>",
            "Override the package manager to use (e.g., npm, pnpm, yarn, bun)"
        );
}
