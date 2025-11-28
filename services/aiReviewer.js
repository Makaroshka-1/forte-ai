const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class AIReviewer {
    constructor() {
        this.apiKey = config.deepseek.apiKey;
        this.apiUrl = config.deepseek.apiUrl;
        this.model = config.deepseek.model;
    }

    async reviewCode(mrDetails, codeDiff) {
        const prompt = this.buildPrompt(mrDetails, codeDiff);

        try {
            logger.info('Sending code to DeepSeek AI for analysis...');

            const response = await axios.post(
                this.apiUrl,
                {
                    model: this.model,
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a senior software engineer performing code review. Analyze code changes thoroughly and provide actionable feedback.'
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.3,
                    max_tokens: 2000,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${this.apiKey}`,
                    },
                }
            );

            const analysis = response.data.choices[0].message.content;
            logger.success('AI analysis completed');
            return this.parseAIResponse(analysis);

        } catch (error) {
            logger.error('DeepSeek API error:', error.response?.data || error.message);
            throw error;
        }
    }

    buildPrompt(mrDetails, codeDiff) {
        return `
# Code Review Request

## Merge Request Details
- **Title**: ${mrDetails.title}
- **Description**: ${mrDetails.description || 'No description provided'}
- **Author**: ${mrDetails.author?.name || 'Unknown'}

## Code Changes
${codeDiff}

## Your Task
Analyze the code changes and provide:

1. **Critical Issues** (🔴): Security vulnerabilities, bugs, breaking changes
2. **Warnings** (🟡): Code smells, potential issues, performance concerns
3. **Suggestions** (💡): Best practices, improvements, optimizations
4. **Positive Notes** (✅): Good patterns, well-written code

Finally, provide a **recommendation**:
- **MERGE** - Code is ready to merge
- **NEEDS FIXES** - Minor issues that should be addressed
- **REJECT** - Critical issues that must be fixed

Format your response as:

### 🔴 Critical Issues
- [Issue 1]
- [Issue 2]

### 🟡 Warnings
- [Warning 1]

### 💡 Suggestions
- [Suggestion 1]

### ✅ What's Good
- [Positive note]

### 📋 Final Recommendation
**MERGE** / **NEEDS FIXES** / **REJECT**

Rationale: [Brief explanation]
`.trim();
    }

    parseAIResponse(aiResponse) {
        let recommendation = 'NEEDS FIXES';
        if (aiResponse.includes('**MERGE**')) {
            recommendation = 'MERGE';
        } else if (aiResponse.includes('**REJECT**')) {
            recommendation = 'REJECT';
        }

        return {
            fullAnalysis: aiResponse,
            recommendation: recommendation,
            hasIssues: !aiResponse.includes('**MERGE**'),
        };
    }
}

module.exports = new AIReviewer();
