import fs from "fs-extra";
import path from "path";
import os from "os";
import chalk from "chalk";

interface EditorConfig {
    command: string;
}

export interface TshackConfig {
    editor: EditorConfig;
    packageManager: string;
    defaultWorkspacePath: string;
}

const DEFAULT_CONFIG: TshackConfig = {
    editor: {
        command: "cursor",
    },
    packageManager: "pnpm",
    defaultWorkspacePath: path.join(os.homedir(), "ts-hacks"),
};

export class ConfigManager {
    private configPath: string;
    private config: TshackConfig;

    constructor() {
        this.configPath = path.join(os.homedir(), ".tshack");
        this.config = this.loadConfig();
    }

    private loadConfig(): TshackConfig {
        try {
            if (!fs.existsSync(this.configPath)) {
                fs.writeJSONSync(this.configPath, DEFAULT_CONFIG, {
                    spaces: 2,
                });
                return DEFAULT_CONFIG;
            }

            const userConfig = fs.readJSONSync(this.configPath);
            return {
                ...DEFAULT_CONFIG,
                ...userConfig,
                editor: {
                    ...DEFAULT_CONFIG.editor,
                    ...userConfig.editor,
                },
            };
        } catch (error) {
            console.warn("Failed to load config, using defaults:", error);
            return DEFAULT_CONFIG;
        }
    }

    public getConfig(): TshackConfig {
        return this.config;
    }

    /**
     * Saves the current configuration to disk
     */
    public saveConfig(): void {
        try {
            fs.writeJSONSync(this.configPath, this.config, {
                spaces: 2,
            });
        } catch (error) {
            console.error(chalk.red("Failed to save configuration:"), error);
            throw error;
        }
    }

    public getWorkspacePath(name: string): string {
        return path.join(this.config.defaultWorkspacePath, name);
    }

    public getProjectsPath(): string {
        return this.getWorkspacePath("projects");
    }

    public getScriptsPath(): string {
        return this.getWorkspacePath("scripts");
    }
}
