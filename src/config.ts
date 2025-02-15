import fs from "fs-extra";
import path from "path";
import os from "os";

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
        command: "code",
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
