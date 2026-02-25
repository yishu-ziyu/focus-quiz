// LLM Client for Focus Quiz

class LLMClient {
    constructor() {
        this.systemPrompt = `You are a helpful education assistant.
Your goal is to generate a quiz based on the text provided by the user.
You MUST output strictly valid JSON.
The JSON structure should be:
{
  "questions": [
    {
      "type": "single_choice",
      "question": "Question text here",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0, // Index of correct option
      "explanation": "Why this is correct"
    },
    {
      "type": "true_false",
      "question": "Statement here",
      "options": ["True", "False"],
      "correctAnswer": 0, // 0 for True, 1 for False
      "explanation": "Why this is correct"
    }
  ]
}
Generate exactly 1 single_choice question and 1 true_false question based on the content.
Ensure the questions test understanding of the key concepts in the text.`;
    }

    async generateQuiz(text) {
        const config = await this.getConfig();
        if (!config.apiKey) {
            throw new Error("API Key not set. Please configure it in extension options.");
        }

        if (config.provider === 'openai') {
            return this.callOpenAI(text, config.apiKey);
        } else if (config.provider === 'gemini') {
            return this.callGemini(text, config.apiKey);
        } else if (config.provider === 'minimax') {
            return this.callMiniMax(text, config.apiKey);
        } else {
            throw new Error("Unknown provider");
        }
    }

    async getConfig() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['provider', 'openaiKey', 'geminiKey', 'minimaxKey'], (result) => {
                const provider = result.provider || 'openai';
                let apiKey = '';
                if (provider === 'openai') apiKey = result.openaiKey;
                if (provider === 'gemini') apiKey = result.geminiKey;
                if (provider === 'minimax') apiKey = result.minimaxKey;
                console.log("[Focus Quiz] Config loaded - Provider:", provider, "API Key set:", !!apiKey);
                resolve({ provider, apiKey });
            });
        });
    }

    async callOpenAI(text, apiKey) {
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        { role: "system", content: this.systemPrompt },
                        { role: "user", content: text }
                    ],
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Create OpenAI request failed');
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            return this.parseResponse(content);
        } catch (e) {
            console.error("OpenAI Call Error", e);
            throw e;
        }
    }

    async callGemini(text, apiKey) {
        try {
            // Gemini Flash or Pro
            const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: `${this.systemPrompt}\n\nInput Text:\n${text}`
                        }]
                    }],
                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || 'Gemini request failed');
            }

            const data = await response.json();
            const content = data.candidates[0].content.parts[0].text;
            return this.parseResponse(content);
        } catch (e) {
            console.error("Gemini Call Error", e);
            throw e;
        }
    }

    parseResponse(content) {
        try {
            // Clean up markdown code blocks if present
            const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
            return JSON.parse(cleanContent);
        } catch (e) {
            console.error("JSON Parse Error", e);
            throw new Error("Failed to parse model response. Please try again.");
        }
    }

    async callMiniMax(text, apiKey) {
        try {
            // MiniMax OpenAI Compatible Endpoint
            // Doc: https://platform.minimaxi.com/docs/api-reference/text-openai-api
            // Base URL: https://api.minimaxi.com/v1
            const url = `https://api.minimaxi.com/v1/chat/completions`;

            const payload = {
                model: "MiniMax-M2.1",
                messages: [
                    { role: "system", content: this.systemPrompt },
                    { role: "user", content: text }
                ],
                temperature: 0.7
            };

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error?.message || err.base_resp?.status_msg || 'MiniMax request failed');
            }

            const data = await response.json();
            const content = data.choices[0].message.content;
            return this.parseResponse(content);
        } catch (e) {
            console.error("MiniMax Call Error", e);
            throw e;
        }
    }
}

export default new LLMClient();
