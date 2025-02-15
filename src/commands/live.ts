import { execa } from "execa";
import chalk from "chalk";
import chokidar from "chokidar";
import fs from "fs-extra";
import path from "path";
import { createStandaloneFile } from "../utils/files.js";
import { getScriptPath } from "../utils/paths.js";
import { promptForProjectName } from "../utils/prompt.js";
import { ConfigManager } from "../config.js";
import { installDependencies } from "../dependencies.js";
import { openInEditor } from "../editor.js";

const configManager = new ConfigManager();

export interface LiveCommandOptions {
    name?: string;
    editor?: string;
    packageManager?: string;
}

/**
 * Extracts package names from import statements in a TypeScript file
 * @param filePath Path to the TypeScript file
 * @returns Array of package names
 */
async function extractDependencies(filePath: string): Promise<string[]> {
    const content = await fs.readFile(filePath, "utf-8");
    const importRegex = /from\s+['"]([^./][^'"]+)['"]/g;
    const packages = new Set<string>();

    let match;
    while ((match = importRegex.exec(content)) !== null) {
        const packageName = match[1].split("/")[0];
        packages.add(packageName);
    }

    return Array.from(packages);
}

/**
 * Installs missing dependencies for a TypeScript file
 * @param filePath Path to the TypeScript file
 */
async function installMissingDependencies(filePath: string): Promise<void> {
    const packages = await extractDependencies(filePath);
    if (packages.length === 0) return;

    const { packageManager } = configManager.getConfig();
    const scriptsDir = configManager.getScriptsPath();

    // Ensure scripts directory exists and has a package.json
    if (!fs.existsSync(path.join(scriptsDir, "package.json"))) {
        await fs.writeJSON(
            path.join(scriptsDir, "package.json"),
            {
                name: "tshack-scripts",
                private: true,
                type: "module",
            },
            { spaces: 2 }
        );
    }

    // Change to scripts directory to install dependencies
    const originalDir = process.cwd();
    process.chdir(scriptsDir);

    console.log(
        chalk.yellow(`📦 Installing dependencies in scripts directory: ${packages.join(", ")}...`)
    );

    try {
        await execa(packageManager, ["add", ...packages], { stdio: "inherit" });
    } finally {
        // Always change back to original directory
        process.chdir(originalDir);
    }
}

/**
 * Executes a TypeScript file using tsx
 * @param filePath Path to the TypeScript file
 */
async function executeFile(filePath: string): Promise<void> {
    try {
        await installMissingDependencies(filePath);
        console.log(chalk.blue(`🚀 Executing ${path.basename(filePath)}...`));
        await execa("tsx", ["watch", filePath], {
            stdio: "inherit",
            env: { ...process.env, FORCE_COLOR: "true" },
        });
    } catch (error) {
        console.error(chalk.red("❌ Execution failed:"), error);
    }
}

/**
 * Handles the live command functionality
 * @param options Command options
 */
export async function handleLiveCommand(options: LiveCommandOptions = {}): Promise<void> {
    let fileName = await promptForProjectName(options.name);

    // Add .ts extension if not present
    if (!fileName.endsWith(".ts")) {
        fileName += ".ts";
    }

    const filePath = getScriptPath(fileName);

    // Create file if it doesn't exist
    if (!fs.existsSync(filePath)) {
        console.log(chalk.blue(`📝 Creating new file: ${fileName}...`));
        createStandaloneFile(filePath);
    }

    // Override config values if provided in options
    if (options.editor) {
        configManager.getConfig().editor.command = options.editor;
    }

    if (options.packageManager) {
        configManager.getConfig().packageManager = options.packageManager;
    }

    await openInEditor(filePath);
    console.log(chalk.green(`✅ Standalone file ready: ${filePath}`));

    // Watch for file changes and execute
    const watcher = chokidar.watch(filePath, {
        persistent: true,
        ignoreInitial: false,
    });

    // watcher.on("add", executeFile);
    watcher.on("change", executeFile);

    // Handle process termination
    process.on("SIGINT", () => {
        console.log(chalk.yellow("\n👋 Stopping file execution..."));
        watcher.close();
        process.exit(0);
    });
}
