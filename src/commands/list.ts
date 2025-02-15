import chalk from "chalk";
import fs from "fs-extra";
import { ConfigManager } from "../config.js";

const configManager = new ConfigManager();

export interface ListCommandOptions {
    type?: "all" | "projects" | "scripts";
}

/**
 * Lists all projects and scripts in the workspace
 * @param options Command options
 */
export async function handleListCommand(options: ListCommandOptions = {}): Promise<void> {
    const type = options.type || "all";

    try {
        if (type === "all" || type === "projects") {
            await listProjects();
        }

        if (type === "all" || type === "scripts") {
            await listScripts();
        }
    } catch (error) {
        console.error(chalk.red("❌ Failed to list workspace contents:"), error);
        process.exit(1);
    }
}

/**
 * Lists all projects in the workspace
 */
async function listProjects(): Promise<void> {
    const projectsPath = configManager.getProjectsPath();

    if (!fs.existsSync(projectsPath)) {
        console.log(chalk.yellow("No projects directory found."));
        return;
    }

    const projects = await fs.readdir(projectsPath);

    if (projects.length === 0) {
        console.log(chalk.yellow("No projects found."));
        return;
    }

    console.log(chalk.blue("\n📁 Projects:"));
    projects.forEach((project) => {
        console.log(chalk.green(`  • ${project}`));
    });
}

/**
 * Lists all scripts in the workspace
 */
async function listScripts(): Promise<void> {
    const scriptsPath = configManager.getScriptsPath();

    if (!fs.existsSync(scriptsPath)) {
        console.log(chalk.yellow("No scripts directory found."));
        return;
    }

    const scripts = (await fs.readdir(scriptsPath)).filter((file) => file.endsWith(".ts"));

    if (scripts.length === 0) {
        console.log(chalk.yellow("No scripts found."));
        return;
    }

    console.log(chalk.blue("\n📜 Scripts:"));
    scripts.forEach((script) => {
        console.log(chalk.green(`  • ${script}`));
    });
}
