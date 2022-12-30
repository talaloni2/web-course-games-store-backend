import type { Config } from "@jest/types";
export default async (): Promise<Config.InitialOptions> => {
  return {
    preset: "ts-jest",
    displayName: {
      name: "GameStoreBackend",
      color: "greenBright",
    },
    verbose: true,
    testMatch: ["**/**/*.test.ts"],
    testEnvironment: "node",
    detectOpenHandles: true,
    collectCoverage: true,
    transform: { "^.+\\.tsx?$": "ts-jest" },
    globalSetup: "<rootDir>/src/tests/jest-globals-setup.ts",
    globalTeardown: "<rootDir>/src/tests/jest-globals-teardown.ts",
    forceExit: true,
  };
};
