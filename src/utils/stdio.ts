import readline from "readline";

/**
 * Clears stdin buffer to prevent previous prompts from affecting our prompt
 */
export function clearStdinBuffer(): Promise<void> {
    return new Promise((resolve) => {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
        });

        // Clear any pending input
        readline.emitKeypressEvents(process.stdin);
        process.stdin.setRawMode?.(true);

        const onData = () => {
            process.stdin.removeListener("data", onData);
            process.stdin.setRawMode?.(false);
            rl.close();
            resolve();
        };

        process.stdin.on("data", onData);

        // If no data within 100ms, assume buffer is clear
        setTimeout(() => {
            process.stdin.removeListener("data", onData);
            process.stdin.setRawMode?.(false);
            rl.close();
            resolve();
        }, 100);
    });
}
