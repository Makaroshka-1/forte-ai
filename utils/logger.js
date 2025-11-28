const colors = {
    reset: '\x1b[0m',
    info: '\x1b[36m',
    success: '\x1b[32m',
    warning: '\x1b[33m',
    error: '\x1b[31m',
};

class Logger {
    info(message, ...args) {
        console.log(`${colors.info}[INFO]${colors.reset}`, message, ...args);
    }

    success(message, ...args) {
        console.log(`${colors.success}[SUCCESS]${colors.reset}`, message, ...args);
    }

    warning(message, ...args) {
        console.warn(`${colors.warning}[WARNING]${colors.reset}`, message, ...args);
    }

    error(message, ...args) {
        console.error(`${colors.error}[ERROR]${colors.reset}`, message, ...args);
    }
}

module.exports = new Logger();
