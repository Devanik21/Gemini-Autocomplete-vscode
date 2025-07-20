import fetch from 'node-fetch';
import { ConfigurationManager } from './configurationManager';

export class GeminiService {
    private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    
    constructor(private configManager: ConfigurationManager) {}

    async getCompletions(context: any): Promise<string[]> {
        const apiKey = this.configManager.getApiKey();
        if (!apiKey) {
            throw new Error('Gemini API key not configured');
        }

        const prompt = this.buildPrompt(context);
        
        try {
            const response = await fetch(`${this.baseUrl}?key=${apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 200,
                        candidateCount: 1
                    },
                    safetySettings: [
                        {
                            category: 'HARM_CATEGORY_HARASSMENT',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        },
                        {
                            category: 'HARM_CATEGORY_HATE_SPEECH',
                            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
                        }
                    ]
                })
            });

            if (!response.ok) {
                throw new Error(`Gemini API error: ${response.status}`);
            }

            const data: any = await response.json();
            
            if (!data.candidates || data.candidates.length === 0) {
                return [];
            }

            const completion = data.candidates[0]?.content?.parts?.[0]?.text || '';
            return this.processCompletion(completion, context);

        } catch (error) {
            console.error('Gemini API request failed:', error);
            return [];
        }
    }

    private buildPrompt(context: any): string {
        const { fileType, currentLine, previousLines, nextLines, cursorColumn } = context;
        
        return `You are an intelligent code completion assistant. Complete the following code/text based on context.

File type: ${fileType}
Previous lines:
${previousLines.join('\n')}

Current line (cursor at position ${cursorColumn}): ${currentLine}

Next lines:
${nextLines.join('\n')}

Provide a single, relevant completion that would come immediately after the cursor position. 
- For code: complete statements, functions, or expressions naturally
- For text: complete sentences or paragraphs naturally  
- Keep completions concise and contextually appropriate
- Don't repeat existing content
- Only return the completion text, no explanations

Completion:`;
    }

    private processCompletion(completion: string, context: any): string[] {
        if (!completion) return [];

        // Clean up the completion
        let cleaned = completion.trim();
        
        // Remove common prefixes that might be added by the model
        cleaned = cleaned.replace(/^(Completion:|Here's the completion:|```.*?\n|```)/i, '');
        cleaned = cleaned.replace(/```.*$/s, '');
        cleaned = cleaned.trim();

        if (!cleaned) return [];

        // Split into multiple suggestions if the model provided alternatives
        const suggestions = cleaned.split('\n')
            .filter(line => line.trim().length > 0)
            .slice(0, this.configManager.getMaxSuggestions());

        return suggestions.length > 0 ? suggestions : [cleaned];
    }
}