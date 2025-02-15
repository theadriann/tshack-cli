import fs from "fs-extra";
import chalk from "chalk";
import path from "path";

/**
 * Checks if a path exists and exits if it does
 * @param path The path to check
 * @param type The type of item being checked (for error message)
 */
export function ensurePathDoesNotExist(path: string, type: string): void {
    if (fs.existsSync(path)) {
        console.log(chalk.red(`❌ Error: ${type} ${path} already exists.`));
        process.exit(1);
    }
}

/**
 * Creates a directory and its parents if they don't exist
 * @param path The path to create
 */
export function createDirectory(path: string): void {
    // ensure the path exists
    fs.ensureDirSync(path);
}

/**
 * Copies a template directory to a target path
 * @param templatePath The source template path
 * @param targetPath The target path
 */
export function copyTemplate(templatePath: string, targetPath: string): void {
    // ensure the target path exists
    fs.ensureDirSync(targetPath);
    fs.copySync(templatePath, targetPath);
}

/**
 * Creates a standalone TypeScript file with initial content
 * @param filePath The path where to create the file
 * @param initialContent The initial content of the file
 */
export function createStandaloneFile(
    filePath: string,
    initialContent: string = "// Your TypeScript code here"
): void {
    // ensure the path exists
    fs.ensureDirSync(path.dirname(filePath));
    fs.writeFileSync(filePath, initialContent);
}
