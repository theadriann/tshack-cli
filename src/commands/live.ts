import chalk from "chalk";
import chokidar from "chokidar";
import { execa } from "execa";
import fs from "fs-extra";
import path from "path";
import { ConfigManager } from "../config.js";
import { openInEditor } from "../editor.js";
import { applyConfigOverrides } from "../utils/config.js";
import { createStandaloneFile } from "../utils/files.js";
import { getScriptPath } from "../utils/paths.js";
import { promptForProjectName } from "../utils/prompt.js";

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

    let match: RegExpExecArray | null = null;

    // biome-ignore lint/suspicious/noAssignInExpressions: its ok
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

let currentProcess: ReturnType<typeof execa> | null = null;
let executeTimeout: NodeJS.Timeout | null = null;

/**
 * Executes a TypeScript file using tsx with proper process management
 * @param filePath Path to the TypeScript file
 */
async function executeFile(filePath: string): Promise<void> {
    // Clear any pending execution
    if (executeTimeout) {
        clearTimeout(executeTimeout);
    }

    // Debounce rapid file changes (300ms delay)
    executeTimeout = setTimeout(async () => {
        try {
            // Kill previous process if running
            if (currentProcess && !currentProcess.killed) {
                console.log(chalk.yellow("🔄 Restarting..."));
                currentProcess.kill("SIGTERM");
                // Give the process a moment to clean up
                await new Promise((resolve) => setTimeout(resolve, 100));
                currentProcess = null;
            }

            await installMissingDependencies(filePath);

            console.log(chalk.blue(`\n🚀 Executing ${path.basename(filePath)}...`));
            console.log(chalk.gray("─".repeat(50)));

            // Execute without watch flag - we handle watching ourselves
            currentProcess = execa("tsx", [filePath], {
                stdio: "inherit",
                env: { ...process.env, FORCE_COLOR: "true" },
            });

            await currentProcess;
            console.log(chalk.gray("─".repeat(50)));
            console.log(chalk.green("✅ Execution completed"));
            console.log(chalk.gray("Watching for changes...\n"));
        } catch (error) {
            if (
                error &&
                typeof error === "object" &&
                "signal" in error &&
                (error.signal === "SIGTERM" || error.signal === "SIGKILL")
            ) {
                // Process was killed for restart - this is expected
                return;
            }
            console.log(chalk.gray("─".repeat(50)));
            console.error(chalk.red("❌ Execution failed"));
            console.log(chalk.gray("Watching for changes...\n"));
        }
    }, 300);
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

    applyConfigOverrides(options);
    await openInEditor(filePath);
    console.log(chalk.green(`✅ Standalone file ready: ${filePath}`));

    console.log(chalk.cyan("🔍 Starting live execution mode..."));
    console.log(chalk.gray(`Watching: ${filePath}`));
    console.log(chalk.gray("Press Ctrl+C to stop"));

    // Watch for file changes and execute
    const watcher = chokidar.watch(filePath, {
        persistent: true,
        ignoreInitial: false,
        awaitWriteFinish: {
            stabilityThreshold: 100,
            pollInterval: 50,
        },
    });

    // Execute on initial add and changes
    watcher.on("add", executeFile);
    watcher.on("change", executeFile);

    // Handle process termination
    process.on("SIGINT", () => {
        console.log(chalk.yellow("\n👋 Stopping file execution..."));

        // Clean up timeout
        if (executeTimeout) {
            clearTimeout(executeTimeout);
        }

        // Kill current process
        if (currentProcess && !currentProcess.killed) {
            currentProcess.kill();
        }

        watcher.close();
        process.exit(0);
    });
}
