const express = require('express');
const bodyParser = require('body-parser');
const config = require('./config');
const logger = require('./utils/logger');
const gitlabService = require('./services/gitlab');
const aiReviewer = require('./services/aiReviewer');
const commentFormatter = require('./services/commentFormatter');

const app = express();
app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.json({ status: 'AI Code Reviewer is running! 🚀' });
});

app.post('/webhook/gitlab', async (req, res) => {
    try {
        // Verify webhook secret
        const token = req.headers['x-gitlab-token'];
        if (token !== config.webhook.secret) {
            logger.warning('Invalid webhook token received');
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const event = req.body;
        logger.info(`Received webhook event: ${event.object_kind}`);

        // Only process merge request events
        if (event.object_kind !== 'merge_request') {
            return res.json({ message: 'Event ignored (not a merge request)' });
        }

        // Process 'open' and 'update' actions, but avoid infinite loops
        const action = event.object_attributes?.action;
        if (!['open', 'update'].includes(action)) {
            logger.info(`Ignoring MR action: ${action}`);
            return res.json({ message: `Action '${action}' ignored` });
        }

        const mrIid = event.object_attributes.iid;
        const labels = event.object_attributes?.labels || [];
        const hasAILabel = labels.some(label => label.title === 'ai-reviewed');

        // Skip if this is an update and we've already reviewed it
        // (prevents infinite loop from our own label updates)
        if (action === 'update' && hasAILabel) {
            logger.info(`Skipping MR !${mrIid} - already reviewed (has ai-reviewed label)`);
            return res.json({ message: 'Already reviewed, skipping' });
        }

        logger.info(`Processing MR !${mrIid} (action: ${action})`);

        // Respond immediately to GitLab (we'll process async)
        res.json({ message: 'Webhook received, processing...' });

        // Process the merge request asynchronously
        processMetgeRequest(mrIid).catch(error => {
            logger.error('Error processing MR:', error);
        });

    } catch (error) {
        logger.error('Webhook error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

/**
 * Process a merge request
 */
async function processMetgeRequest(mrIid) {
    try {
        const startTime = Date.now();
        logger.info(`🔍 Starting analysis of MR !${mrIid}`);

        logger.info('📥 Fetching MR details...');
        const mrDetails = await gitlabService.getMergeRequest(mrIid);

        logger.info('📥 Fetching code changes...');
        const changes = await gitlabService.getMergeRequestChanges(mrIid);
        const codeDiff = gitlabService.formatDiffForAI(changes);

        logger.info('🤖 Analyzing code with DeepSeek AI...');
        const analysis = await aiReviewer.reviewCode(mrDetails, codeDiff);

        logger.info('💬 Posting review comment...');
        const comment = commentFormatter.formatReviewComment(analysis, mrDetails);
        await gitlabService.postComment(mrIid, comment);

        logger.info('🏷️  Updating labels...');
        const labels = commentFormatter.getLabelsForRecommendation(analysis.recommendation);
        await gitlabService.updateLabels(mrIid, labels);

        const duration = ((Date.now() - startTime) / 1000).toFixed(2);
        logger.success(`✅ MR !${mrIid} reviewed successfully in ${duration}s`);
        logger.info(`📊 Recommendation: ${analysis.recommendation}`);

    } catch (error) {
        logger.error(`Failed to process MR !${mrIid}:`, error.message);
    }
}

/**
 * Start server
 */
const PORT = config.webhook.port;
app.listen(PORT, () => {
    logger.success(`🚀 AI Code Reviewer is running on port ${PORT}`);
    logger.info(`📡 Webhook endpoint: http://localhost:${PORT}/webhook/gitlab`);
    logger.info(`🔑 Webhook secret: ${config.webhook.secret}`);
    logger.info('');
    logger.info('⏳ Waiting for GitLab webhooks...');
});
