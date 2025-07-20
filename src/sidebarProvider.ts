import * as vscode from 'vscode';
import { ConfigurationManager } from './configurationManager';

export class SidebarProvider implements vscode.TreeDataProvider<SidebarItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<SidebarItem | undefined | null | void> = new vscode.EventEmitter<SidebarItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<SidebarItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private configManager: ConfigurationManager) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: SidebarItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: SidebarItem): Thenable<SidebarItem[]> {
        if (!element) {
            return Promise.resolve(this.getRootItems());
        }
        return Promise.resolve([]);
    }

    private getRootItems(): SidebarItem[] {
        const apiKey = this.configManager.getApiKey();
        const isEnabled = this.configManager.isEnabled();
        const maxSuggestions = this.configManager.getMaxSuggestions();
        const triggerDelay = this.configManager.getTriggerDelay();
        
        return [
            new SidebarItem(
                'Status',
                isEnabled ? 'Enabled ✅' : 'Disabled ❌',
                vscode.TreeItemCollapsibleState.None,
                'gemini-autocomplete.toggleEnabled',
                isEnabled ? 'zap' : 'circle-slash'
            ),
            new SidebarItem(
                'API Key',
                apiKey ? 'Configured ✅' : 'Not Set ❌',
                vscode.TreeItemCollapsibleState.None,
                'gemini-autocomplete.setApiKey',
                apiKey ? 'key' : 'warning'
            ),
            new SidebarItem(
                'Max Suggestions',
                maxSuggestions.toString(),
                vscode.TreeItemCollapsibleState.None,
                undefined,
                'list-ordered'
            ),
            new SidebarItem(
                'Trigger Delay',
                `${triggerDelay}ms`,
                vscode.TreeItemCollapsibleState.None,
                undefined,
                'clock'
            ),
            new SidebarItem(
                'Quick Actions',
                '',
                vscode.TreeItemCollapsibleState.Expanded
            )
        ];
    }
}

class SidebarItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly description: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        commandId?: string, // Renamed to avoid conflict with inherited 'command' property
        public readonly iconName?: string
    ) {
        super(label, collapsibleState);
        this.description = description;
        this.tooltip = `${this.label}: ${this.description}`;
        
        if (iconName === 'zap' || iconName === 'circle-slash' || iconName === 'key' || iconName === 'warning' || iconName === 'list-ordered' || iconName === 'clock') {
            // Only assign ThemeIcon if it's a known icon name
            // This prevents issues with arbitrary strings being passed as iconName
            this.iconPath = new vscode.ThemeIcon(iconName);
        }
        
        if (commandId) {
            this.command = { // Assign to the inherited 'command' property
                command: commandId,
                title: this.label
            };
        }
    }
}