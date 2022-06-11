module.exports = {
    roots: ['<rootDir>/../../tests'],
    testMatch: ['**/*.test.js'],
    collectCoverage: false,
    testTimeout: 60000, //1 minute max time to run all tests
    verbose: true,
    setupFilesAfterEnv: ["<rootDir>/setup.js"]
};
