import chalk from "chalk";
import { execSync } from "child_process";
import inquirer from "inquirer";
import { ConfigManager } from "../config.js";
import { installDependencies } from "../dependencies.js";
import { openInEditor } from "../editor.js";
import { applyConfigOverrides } from "../utils/config.js";
import {
    copyTemplate,
    createDirectory,
    ensurePathDoesNotExist,
    createStandaloneFile as writeStandaloneFile,
} from "../utils/files.js";
import { getProjectPath, getScriptPath, getTemplatePath } from "../utils/paths.js";
import { promptForProjectName } from "../utils/prompt.js";
import { clearStdinBuffer } from "../utils/stdio.js";

const configManager = new ConfigManager();

export interface NewCommandOptions {
    template: string;
    type: "project" | "file";
    editor?: string;
    packageManager?: string;
    create?: string[];
}

interface CdPromptAnswers {
    shouldCd: boolean;
}

/**
 * Prompts the user if they want to cd into the project directory
 * @param projectPath The path to the project
 */
async function promptForCd(projectPath: string): Promise<void> {
    // Clear stdin buffer before showing our prompt
    await clearStdinBuffer();

    // Add a small delay to ensure terminal is ready
    await new Promise((resolve) => setTimeout(resolve, 500));

    const { shouldCd } = await inquirer.prompt<CdPromptAnswers>({
        type: "confirm",
        name: "shouldCd",
        message: "Would you like to change to the project directory?",
        default: true,
    });

    if (shouldCd) {
        console.log(chalk.blue(`\n📂 Changing to project directory...`));
        execSync(`cd ${projectPath} && $SHELL`, { stdio: "inherit" });
    }
}

/**
 * Creates a new TypeScript playground project or standalone file
 * @param name Optional name for the playground/file
 * @param options Command options including template, type, and overrides
 */
export async function handleNewCommand(
    name: string | null | undefined = null,
    options: NewCommandOptions
): Promise<void> {
    applyConfigOverrides(options);

    if (options.type === "project") {
        if (options.create) {
            await createProjectWithPackageManager(name, options);
        } else {
            await createProject(name, options);
        }
    } else {
        await createStandaloneFile(name, options);
    }
}

async function createProject(
    name: string | null | undefined = null,
    options: NewCommandOptions
): Promise<void> {
    const projectName = await promptForProjectName(name || undefined);
    const workspacePath = getProjectPath(projectName);

    ensurePathDoesNotExist(workspacePath, "Folder");
    console.log(chalk.blue(`🚀 Creating playground: ${projectName}...`));

    createDirectory(workspacePath);
    copyTemplate(getTemplatePath(options.template), workspacePath);

    // Change to workspace directory for dependency installation
    const originalDir = process.cwd();
    process.chdir(workspacePath);

    await installDependencies();
    await openInEditor(".");

    // Change back to original directory
    process.chdir(originalDir);

    console.log(chalk.green(`✅ Playground ready: ${workspacePath}`));
    await promptForCd(workspacePath);
}

async function createStandaloneFile(
    name: string | null | undefined = null,
    options: NewCommandOptions
): Promise<void> {
    const fileName = await promptForProjectName(name || undefined);
    const filePath = getScriptPath(fileName);

    ensurePathDoesNotExist(filePath, "File");
    console.log(chalk.blue(`🚀 Creating standalone file: ${fileName}...`));

    writeStandaloneFile(filePath);
    await openInEditor(filePath);

    console.log(chalk.green(`✅ Standalone file ready: ${filePath}`));
}

async function createProjectWithPackageManager(
    name: string | null | undefined = null,
    options: NewCommandOptions
): Promise<void> {
    const projectName = await promptForProjectName(name || undefined);
    const workspacePath = getProjectPath(projectName);

    ensurePathDoesNotExist(workspacePath, "Folder");
    console.log(chalk.blue(`🚀 Creating project using package manager: ${projectName}...`));

    // Create the project directory
    createDirectory(workspacePath);

    // Change to workspace directory
    const originalDir = process.cwd();
    process.chdir(workspacePath);

    // Run the create command
    const packageManager = configManager.getConfig().packageManager;
    const createCommand = options.create!.join(" ");

    try {
        console.log(chalk.blue(`Running: ${packageManager} create ${createCommand} .`));
        const { execSync } = await import("child_process");
        execSync(`${packageManager} create ${createCommand} .`, { stdio: "inherit" });

        await openInEditor(".");

        // Change back to original directory
        process.chdir(originalDir);

        console.log(chalk.green(`✅ Project ready: ${workspacePath}`));
        await promptForCd(workspacePath);
    } catch (error) {
        // Change back to original directory on error
        process.chdir(originalDir);
        console.error(chalk.red("Failed to create project using package manager command"));
        console.error(error);
        process.exit(1);
    }
}
