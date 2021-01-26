module.exports = {
    roots: ["<rootDir>/source"],
    testMatch: ["**/__tests__/**/*.+(ts|tsx|js)", "**/?(*.)+(spec|test).+(ts|tsx|js)"],
    transform: {
        "^.+\\.(ts|tsx)$": "ts-jest"
    },
    setupFiles: ["dotenv/config"],
    testEnvironment: "node"
}
