import { execa } from "execa";
import chalk from "chalk";
import { ConfigManager } from "./config.js";

const configManager = new ConfigManager();

/**
 * Opens a path in the configured editor
 * @param path The path to open in the editor
 */
export async function openInEditor(path: string): Promise<void> {
    const { editor } = configManager.getConfig();
    console.log(chalk.green("✨ Opening in editor..."));
    await execa(editor.command, [path], { stdio: "inherit" });
}
