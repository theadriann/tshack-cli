import chalk from "chalk";
import fs from "fs-extra";
import inquirer from "inquirer";
import { ConfigManager } from "../config.js";
import { getProjectPath } from "../utils/paths.js";

const configManager = new ConfigManager();

export interface DeleteCommandOptions {
    name?: string;
    force?: boolean;
}

interface Answers {
    selectedProjects: string[];
    confirmed: boolean;
}

/**
 * Lists all available projects in the workspace
 * @returns Array of project names
 */
async function listAvailableProjects(): Promise<string[]> {
    const projectsPath = configManager.getProjectsPath();

    if (!fs.existsSync(projectsPath)) {
        return [];
    }

    return await fs.readdir(projectsPath);
}

/**
 * Prompts the user to select projects to delete
 * @returns Array of selected project names
 */
async function promptForProjects(): Promise<string[]> {
    const projects = await listAvailableProjects();

    if (projects.length === 0) {
        console.log(chalk.yellow("No projects found to delete."));
        process.exit(0);
    }

    const { selectedProjects } = await inquirer.prompt<Pick<Answers, "selectedProjects">>({
        type: "checkbox",
        name: "selectedProjects",
        message: "Select projects to delete:",
        choices: projects,
        validate: (input) => {
            if (input.length === 0) {
                return "Please select at least one project to delete.";
            }
            return true;
        },
    });

    return selectedProjects;
}

/**
 * Prompts for confirmation before deletion
 * @param projects Array of project names to delete
 * @returns Whether the user confirmed the deletion
 */
async function confirmDeletion(projects: string[]): Promise<boolean> {
    const projectList = projects.map((p) => `  • ${p}`).join("\n");
    console.log(chalk.yellow("\nThe following projects will be deleted:"));
    console.log(chalk.red(projectList));

    const { confirmed } = await inquirer.prompt<Pick<Answers, "confirmed">>({
        type: "confirm",
        name: "confirmed",
        message: "Are you sure you want to delete these projects?",
        default: false,
    });

    return confirmed;
}

/**
 * Deletes a single project
 * @param name Project name to delete
 */
async function deleteProject(name: string): Promise<void> {
    const projectPath = getProjectPath(name);

    if (!fs.existsSync(projectPath)) {
        console.log(chalk.yellow(`Project '${name}' not found.`));
        return;
    }

    try {
        await fs.remove(projectPath);
        console.log(chalk.green(`✅ Deleted project: ${name}`));
    } catch (error) {
        console.error(chalk.red(`❌ Failed to delete project '${name}':`, error));
        throw error;
    }
}

/**
 * Handles the delete command functionality
 * @param options Command options
 */
export async function handleDeleteCommand(options: DeleteCommandOptions = {}): Promise<void> {
    try {
        // If a project name is provided, delete it directly
        if (options.name) {
            if (!options.force) {
                const confirmed = await confirmDeletion([options.name]);
                if (!confirmed) {
                    console.log(chalk.yellow("Deletion cancelled."));
                    return;
                }
            }
            await deleteProject(options.name);
            return;
        }

        // Otherwise, show interactive selection
        const selectedProjects = await promptForProjects();

        if (!options.force) {
            const confirmed = await confirmDeletion(selectedProjects);
            if (!confirmed) {
                console.log(chalk.yellow("Deletion cancelled."));
                return;
            }
        }

        // Delete all selected projects
        for (const project of selectedProjects) {
            await deleteProject(project);
        }

        console.log(chalk.green("\n✨ All selected projects have been deleted."));
    } catch (error) {
        console.error(chalk.red("❌ Failed to delete projects:"), error);
        process.exit(1);
    }
}
