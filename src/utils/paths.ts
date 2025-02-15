import path from "path";
import { ConfigManager } from "../config.js";

const configManager = new ConfigManager();

/**
 * Gets the full path for a project in the workspace
 * @param name The name of the project
 * @returns The full path to the project directory
 */
export function getProjectPath(name: string): string {
    return path.join(configManager.getProjectsPath(), name);
}

/**
 * Gets the full path for a standalone script file
 * @param name The name of the script file
 * @returns The full path to the script file
 */
export function getScriptPath(name: string): string {
    return path.join(configManager.getScriptsPath(), name);
}

/**
 * Gets the template path for a given template name
 * @param templateName The name of the template
 * @returns The full path to the template directory
 */
export function getTemplatePath(templateName: string): string {
    return path.join(process.cwd(), "templates", templateName);
}
