import * as vscode from 'vscode';
import { GeminiService } from './geminiService';
import { ConfigurationManager } from './configurationManager';
import { ContextAnalyzer } from './contextAnalyzer';

export class GeminiCompletionProvider implements vscode.InlineCompletionItemProvider {
    private geminiService: GeminiService;
    private contextAnalyzer: ContextAnalyzer;
    private debounceTimer: NodeJS.Timeout | null = null;

    constructor(private configManager: ConfigurationManager) {
        this.geminiService = new GeminiService(configManager);
        this.contextAnalyzer = new ContextAnalyzer();
    }

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[]> {
        
        if (!this.configManager.isEnabled() || !this.configManager.getApiKey()) {
            return [];
        }

        try {
            const contextData = this.contextAnalyzer.analyzeContext(document, position);
            
            if (!this.shouldTriggerCompletion(contextData)) {
                return [];
            }

            const completions = await this.geminiService.getCompletions(contextData);
            
            return completions.map((completion: string) => new vscode.InlineCompletionItem(
                completion,
                new vscode.Range(position, position)
            ));

        } catch (error) {
            console.error('Gemini completion error:', error);
            return [];
        }
    }

    private shouldTriggerCompletion(context: any): boolean {
        // Don't trigger on empty lines or single characters
        if (context.currentLine.trim().length < 2) {
            return false;
        }

        // Don't trigger inside strings (basic detection)
        const line = context.currentLine;
        const beforeCursor = line.substring(0, context.cursorColumn);
        const stringQuotes = (beforeCursor.match(/"/g) || []).length + (beforeCursor.match(/'/g) || []).length;
        
        if (stringQuotes % 2 === 1) {
            return false;
        }

        return true;
    }
}