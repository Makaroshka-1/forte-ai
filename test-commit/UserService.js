export class UserService {
    // BUG 1: Synchronous file operations blocking event loop
    getUserData(userId) {
        const fs = require('fs');
        const data = fs.readFileSync(`/data/users/${userId}.json`);
        return JSON.parse(data);
    }

    // BUG 2: Memory leak - not cleaning up listeners
    subscribeToUpdates(callback) {
        process.on('userUpdate', callback);
        // Missing: process.removeListener
    }

    // BUG 3: Inefficient algorithm - O(n²) complexity
    findDuplicateUsers(users) {
        const duplicates = [];
        for (let i = 0; i < users.length; i++) {
            for (let j = i + 1; j < users.length; j++) {
                if (users[i].email === users[j].email) {
                    duplicates.push(users[i]);
                }
            }
        }
        return duplicates;
    }

    // BUG 4: Race condition
    async incrementCounter(userId) {
        const user = await this.getUser(userId);
        user.loginCount = user.loginCount + 1;
        // Another request might update in between
        await this.saveUser(user);
    }

    // BUG 5: No timeout on external API calls
    async fetchExternalData(url) {
        const response = await fetch(url);
        return response.json();
    }

    // BUG 6: Improper error handling
    processPayment(amount) {
        try {
            return this.chargeCard(amount);
        } catch (e) {
            console.log('Error occurred');
            // Silently failing - user won't know about error
        }
    }
}
