import * as vscode from 'vscode';
import * as path from 'path';
// Removed the import for ConfigurationManager as it's not needed here
import { ConfigurationManager } from './configurationManager';
export class ContextAnalyzer {
    
    analyzeContext(document: vscode.TextDocument, position: vscode.Position) {
        const fileExtension = path.extname(document.fileName).toLowerCase();
        const fileType = this.getFileType(fileExtension);
        
        const currentLine = document.lineAt(position.line).text;
        const cursorColumn = position.character;
        // Instantiate ConfigurationManager directly within the method
        const configManager = new ConfigurationManager(); 
        const contextLines = configManager.getContextLines();
        
        // Get previous lines
        const startLine = Math.max(0, position.line - contextLines);
        const previousLines: string[] = [];
        for (let i = startLine; i < position.line; i++) {
            previousLines.push(document.lineAt(i).text);
        }
        
        // Get next lines
        const endLine = Math.min(document.lineCount - 1, position.line + contextLines);
        const nextLines: string[] = [];
        for (let i = position.line + 1; i <= endLine; i++) {
            nextLines.push(document.lineAt(i).text);
        }
        
        return {
            fileType,
            fileExtension,
            currentLine,
            cursorColumn,
            previousLines,
            nextLines,
            position,
            document
        };
    }
    
    private getFileType(extension: string): string {
        const typeMap: { [key: string]: string } = {
            '.js': 'JavaScript',
            '.ts': 'TypeScript',
            '.jsx': 'React JSX',
            '.tsx': 'React TSX',
            '.py': 'Python',
            '.java': 'Java',
            '.cpp': 'C++',
            '.c': 'C',
            '.cs': 'C#',
            '.php': 'PHP',
            '.rb': 'Ruby',
            '.go': 'Go',
            '.rs': 'Rust',
            '.swift': 'Swift',
            '.kt': 'Kotlin',
            '.scala': 'Scala',
            '.r': 'R',
            '.m': 'Objective-C',
            '.sh': 'Shell Script',
            '.bash': 'Bash',
            '.zsh': 'Zsh',
            '.fish': 'Fish Shell',
            '.ps1': 'PowerShell',
            '.bat': 'Batch',
            '.cmd': 'Command',
            '.html': 'HTML',
            '.htm': 'HTML',
            '.css': 'CSS',
            '.scss': 'SCSS',
            '.sass': 'Sass',
            '.less': 'Less',
            '.xml': 'XML',
            '.json': 'JSON',
            '.yaml': 'YAML',
            '.yml': 'YAML',
            '.toml': 'TOML',
            '.ini': 'INI',
            '.cfg': 'Configuration',
            '.conf': 'Configuration',
            '.properties': 'Properties',
            '.sql': 'SQL',
            '.md': 'Markdown',
            '.txt': 'Plain Text',
            '.log': 'Log File',
            '.dockerfile': 'Dockerfile',
            '.makefile': 'Makefile',
            '.gitignore': 'Git Ignore',
            '.env': 'Environment Variables',
            '.vue': 'Vue.js',
            '.svelte': 'Svelte',
            '.elm': 'Elm',
            '.dart': 'Dart',
            '.lua': 'Lua',
            '.perl': 'Perl',
            '.pl': 'Perl',
            '.vim': 'Vim Script',
            '.tex': 'LaTeX',
            '.asm': 'Assembly',
            '.s': 'Assembly',
            '.f90': 'Fortran',
            '.f': 'Fortran',
            '.clj': 'Clojure',
            '.cljs': 'ClojureScript',
            '.hs': 'Haskell',
            '.ml': 'OCaml',
            '.fs': 'F#',
            '.ex': 'Elixir',
            '.exs': 'Elixir Script',
            '.erl': 'Erlang',
            '.hrl': 'Erlang Header',
            '.nim': 'Nim',
            '.cr': 'Crystal',
            '.d': 'D',
            '.pas': 'Pascal',
            '.pp': 'Pascal',
            '.ada': 'Ada',
            '.adb': 'Ada',
            '.ads': 'Ada',
            '.v': 'Verilog',
            '.vh': 'Verilog Header',
            '.vhd': 'VHDL',
            '.vhdl': 'VHDL'
        };
        
        return typeMap[extension] || 'Unknown';
    }
}