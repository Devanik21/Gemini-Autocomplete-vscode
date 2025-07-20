import * as vscode from 'vscode';

export class ConfigurationManager {
    private readonly configSection = 'geminiAutocomplete';

    getApiKey(): string {
        return vscode.workspace.getConfiguration(this.configSection).get<string>('apiKey', '');
    }

    async setApiKey(apiKey: string): Promise<void> {
        await vscode.workspace.getConfiguration(this.configSection).update(
            'apiKey',
            apiKey,
            vscode.ConfigurationTarget.Global
        );
    }

    isEnabled(): boolean {
        return vscode.workspace.getConfiguration(this.configSection).get<boolean>('enabled', true);
    }

    async setEnabled(enabled: boolean): Promise<void> {
        await vscode.workspace.getConfiguration(this.configSection).update(
            'enabled',
            enabled,
            vscode.ConfigurationTarget.Global
        );
    }

    getMaxSuggestions(): number {
        return vscode.workspace.getConfiguration(this.configSection).get<number>('maxSuggestions', 3);
    }

    getTriggerDelay(): number {
        return vscode.workspace.getConfiguration(this.configSection).get<number>('triggerDelay', 500);
    }

    getContextLines(): number {
        return vscode.workspace.getConfiguration(this.configSection).get<number>('contextLines', 10);
    }
}