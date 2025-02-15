import { execa } from "execa";
import chalk from "chalk";
import { ConfigManager } from "./config.js";

const configManager = new ConfigManager();

/**
 * Installs dependencies in the current directory using the configured package manager
 */
export async function installDependencies(): Promise<void> {
    const { packageManager } = configManager.getConfig();
    console.log(chalk.yellow("📦 Installing dependencies..."));
    await execa(packageManager, ["install"], { stdio: "inherit" });
}
