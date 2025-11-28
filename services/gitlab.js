const axios = require('axios');
const config = require('../config');
const logger = require('../utils/logger');

class GitLabService {
    constructor() {
        this.baseUrl = `${config.gitlab.url}/api/v4`;
        this.token = config.gitlab.token;
        this.projectId = config.gitlab.projectId;
    }

    async getMergeRequest(mrIid) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/projects/${this.projectId}/merge_requests/${mrIid}`,
                { headers: { 'PRIVATE-TOKEN': this.token } }
            );
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch MR details:', error.message);
            throw error;
        }
    }

    async getMergeRequestChanges(mrIid) {
        try {
            const response = await axios.get(
                `${this.baseUrl}/projects/${this.projectId}/merge_requests/${mrIid}/changes`,
                { headers: { 'PRIVATE-TOKEN': this.token } }
            );
            return response.data;
        } catch (error) {
            logger.error('Failed to fetch MR changes:', error.message);
            throw error;
        }
    }

    async postComment(mrIid, comment) {
        try {
            const response = await axios.post(
                `${this.baseUrl}/projects/${this.projectId}/merge_requests/${mrIid}/notes`,
                { body: comment },
                { headers: { 'PRIVATE-TOKEN': this.token } }
            );
            logger.success(`Posted comment to MR !${mrIid}`);
            return response.data;
        } catch (error) {
            logger.error('Failed to post comment:', error.message);
            throw error;
        }
    }

    async updateLabels(mrIid, labels) {
        try {
            const response = await axios.put(
                `${this.baseUrl}/projects/${this.projectId}/merge_requests/${mrIid}`,
                { labels: labels.join(',') },
                { headers: { 'PRIVATE-TOKEN': this.token } }
            );
            logger.success(`Updated labels for MR !${mrIid}: ${labels.join(', ')}`);
            return response.data;
        } catch (error) {
            logger.error('Failed to update labels:', error.message);
            throw error;
        }
    }

    formatDiffForAI(changes) {
        let formattedDiff = '';
        changes.changes.forEach(file => {
            formattedDiff += `\n\n## File: ${file.new_path}\n`;
            formattedDiff += `\`\`\`diff\n${file.diff}\n\`\`\`\n`;
        });
        return formattedDiff;
    }
}

module.exports = new GitLabService();
