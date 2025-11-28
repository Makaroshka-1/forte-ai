class CommentFormatter {
    formatReviewComment(analysis, mrDetails) {
        const timestamp = new Date().toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
## 🤖 AI Code Review

**Reviewed by**: AI Code Review Assistant  
**Date**: ${timestamp}  
**Merge Request**: !${mrDetails.iid} - ${mrDetails.title}

---

${analysis.fullAnalysis}

---

<sub>Powered by DeepSeek AI | This is an automated review to assist senior developers</sub>
`.trim();
    }

    getLabelsForRecommendation(recommendation) {
        switch (recommendation) {
            case 'MERGE':
                return ['ai-reviewed', 'ready-for-merge'];
            case 'NEEDS FIXES':
                return ['ai-reviewed', 'needs-review'];
            case 'REJECT':
                return ['ai-reviewed', 'changes-requested'];
            default:
                return ['ai-reviewed'];
        }
    }

    createSummary(analysis) {
        const emoji = {
            'MERGE': '✅',
            'NEEDS FIXES': '⚠️',
            'REJECT': '❌'
        };

        return `${emoji[analysis.recommendation] || '🔍'} AI Recommendation: **${analysis.recommendation}**`;
    }
}

module.exports = new CommentFormatter();
