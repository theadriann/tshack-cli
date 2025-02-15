import chalk from "chalk";
import { promptForProjectName } from "../utils/prompt.js";
import { getProjectPath, getScriptPath, getTemplatePath } from "../utils/paths.js";
import {
    ensurePathDoesNotExist,
    createDirectory,
    copyTemplate,
    createStandaloneFile as writeStandaloneFile,
} from "../utils/files.js";
import { openInEditor } from "../editor.js";
import { installDependencies } from "../dependencies.js";
import { ConfigManager } from "../config.js";

const configManager = new ConfigManager();

export interface NewCommandOptions {
    template: string;
    type: "project" | "file";
    editor?: string;
    packageManager?: string;
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
    // Override config values if provided in options
    if (options.editor) {
        configManager.getConfig().editor.command = options.editor;
    }

    if (options.packageManager) {
        configManager.getConfig().packageManager = options.packageManager;
    }

    if (options.type === "project") {
        await createProject(name, options);
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

    // Change to workspace directory
    process.chdir(workspacePath);

    await installDependencies();
    await openInEditor(".");

    console.log(chalk.green(`✅ Playground ready: ${workspacePath}`));
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
