import inquirer from "inquirer";

interface ProjectNamePrompt {
    projectName: string;
}

/**
 * Prompts the user for a project name if not provided
 * @param defaultName Optional default name to use if user doesn't provide one
 * @returns The project name
 */
export async function promptForProjectName(defaultName?: string): Promise<string> {
    if (!defaultName) {
        const answer = await inquirer.prompt<ProjectNamePrompt>([
            {
                type: "input",
                name: "projectName",
                message: "Enter project name:",
            },
        ]);
        return answer.projectName || `playground-${Date.now()}`;
    }
    return defaultName;
}
