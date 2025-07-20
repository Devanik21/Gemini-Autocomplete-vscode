import * as vscode from 'vscode';
import { GeminiCompletionProvider } from './completionProvider';
import { ConfigurationManager } from './configurationManager';
import { SidebarProvider } from './sidebarProvider';

export function activate(context: vscode.ExtensionContext) {
    console.log('Gemini Universal Autocomplete is now active');

    const configManager = new ConfigurationManager();
    const completionProvider = new GeminiCompletionProvider(configManager);
    const sidebarProvider = new SidebarProvider(configManager);

    // Register sidebar tree view
    const treeView = vscode.window.createTreeView('geminiAutocompleteView', {
        treeDataProvider: sidebarProvider,
        showCollapseAll: false
    });

    // Register completion provider for all file types
    const provider = vscode.languages.registerInlineCompletionItemProvider(
        { pattern: '**' },
        completionProvider
    );

    // Register commands
    const setApiKeyCommand = vscode.commands.registerCommand('gemini-autocomplete.setApiKey', async () => {
        const apiKey = await vscode.window.showInputBox({
            prompt: 'Enter your Gemini API key',
            password: true,
            ignoreFocusOut: true
        });

        if (apiKey) {
            await configManager.setApiKey(apiKey);
            vscode.window.showInformationMessage('Gemini API key set successfully!');
            sidebarProvider.refresh();
        }
    });

    const toggleEnabledCommand = vscode.commands.registerCommand('gemini-autocomplete.toggleEnabled', async () => {
        const currentState = configManager.isEnabled();
        await configManager.setEnabled(!currentState);
        const status = !currentState ? 'enabled' : 'disabled';
        vscode.window.showInformationMessage(`Gemini Autocomplete ${status}`);
        sidebarProvider.refresh();
    });

    const refreshCommand = vscode.commands.registerCommand('gemini-autocomplete.refresh', () => {
        sidebarProvider.refresh();
    });

    const openSettingsCommand = vscode.commands.registerCommand('gemini-autocomplete.openSettings', () => {
        vscode.commands.executeCommand('workbench.action.openSettings', 'geminiAutocomplete');
    });

    // Add to subscriptions
    context.subscriptions.push(
        treeView,
        provider,
        setApiKeyCommand,
        toggleEnabledCommand,
        refreshCommand,
        openSettingsCommand
    );

    // Configuration change listener
    vscode.workspace.onDidChangeConfiguration(e => {
        if (e.affectsConfiguration('geminiAutocomplete')) {
            sidebarProvider.refresh();
        }
    });

    // Show welcome message if API key is not set
    if (!configManager.getApiKey()) {
        vscode.window.showWarningMessage(
            'Gemini API key not set. Use "Set API Key" command to configure.',
            'Set API Key'
        ).then(selection => {
            if (selection === 'Set API Key') {
                vscode.commands.executeCommand('gemini-autocomplete.setApiKey');
            }
        });
    }
}

export function deactivate() {
    console.log('Gemini Universal Autocomplete deactivated');
}