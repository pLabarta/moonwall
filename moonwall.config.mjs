// import { MoonwallConfig } from "./src/index.js";
export default function globalConfig()/** : MoonwallConfig */{
  return {
    label: "Global Test Config 🐯",
    defaultTestTimeout: 40000,
    environments: [
      {
        name: "mb_skip",
        testFileDir: ["tests/dummy-smoke/"],
        include: ["**/*conditional*"],
        foundation: {
          type: "read_only",
        },
        connections: [
          {
            name: "MB",
            type: "moon",
            endpoints: ["wss://moonbeam.api.onfinality.io/public-ws"],
          },
        ],
      },
      {
        name: "mr_run",
        testFileDir: ["tests/dummy-smoke/"],
        include: ["**/*conditional*"],
        foundation: {
          type: "read_only",
        },
        connections: [
          {
            name: "MB",
            type: "moon",
            endpoints: ["wss://wss.api.moonriver.moonbeam.network"],
          },
        ],
      },
      {
        name: "chop_state_test",
        testFileDir: ["tests/chopsticks/"],
        include: ["**/*state*"],
        foundation: {
          type: "chopsticks",
          launchSpec: [
            {
              name: "mb",
              type: "parachain",
              buildBlockMode: "manual",
              configPath: "./configs/moonbeamChopsticks.yml",
            },
          ],
        },
        connections: [
          {
            name: "MB",
            type: "moon",
            endpoints: ["ws://127.0.0.1:12000"],
          },
        ],
      },
      {
        name: "chopsticks_xcm",
        testFileDir: [],
        foundation: {
          type: "chopsticks",
          launchSpec: [
            {
              name: "mb",
              type: "parachain",
              buildBlockMode: "manual",
              configPath: "./configs/moonriverChopsticks.yml",
            },
            {
              name: "mb",
              type: "parachain",
              buildBlockMode: "manual",
              configPath: "./configs/moonbeamChopsticks.yml",
            },
          ],
        },
        connections: [
          {
            name: "MB",
            type: "moon",
            endpoints: ["ws://127.0.0.1:10000"],
          },
          {
            name: "MR",
            type: "moon",
            endpoints: ["ws://127.0.0.1:12000"],
          },
        ],
      },
      {
        name: "chop_test",
        testFileDir: ["tests/chopsticks/"],
        include: ["**/*basic*"],
        foundation: {
          type: "chopsticks",
          rtUpgradePath: "./tmp/moonriver-runtime-2201.wasm",
          launchSpec: [
            {
              name: "mb",
              type: "parachain",
              buildBlockMode: "manual",
              configPath: "./configs/moonriverChopsticks.yml",
            },
          ],
        },
        connections: [
          {
            name: "MB",
            type: "moon",
            endpoints: ["ws://127.0.0.1:10000"],
          },
        ],
      },
      {
        name: "dev_minimal",
        testFileDir: ["tests/test_separation"],
        threads: 3,
        foundation: {
          type: "dev",
          launchSpec: [
            {
              name: "moonbeam",
              binPath: "./tmp/moonbeam",
            },
          ],
        },
      },
      {
        name: "wrongFoundation",
        testFileDir: ["tests/run_error/"],
        foundation: {
          type: "read_only",
        },
        connections: [
          {
            name: "w3",
            type: "web3",
            endpoints: ["wss://moonbeam.api.onfinality.io/public-ws"],
          },
          {
            name: "mb",
            type: "moon",
            endpoints: ["wss://moonbeam.api.onfinality.io/public-ws"],
          },
        ],
      },
      {
        name: "pass",
        testFileDir: ["tests/run_error/"],
        foundation: {
          type: "dev",
          launchSpec: [
            {
              name: "moonbeam",
              binPath: "./tmp/moonbeam",
              ports: { p2pPort: 30333, wsPort: 9944, rpcPort: 9933 },
              options: [
                "--dev",
                "--no-hardware-benchmarks",
                "--no-telemetry",
                "--reserved-only",
                "--rpc-cors=all",
                "--no-grandpa",
                "--unsafe-ws-external",
                "--sealing=manual",
                "--force-authoring",
                "--no-prometheus",
              ],
            },
          ],
        },
        connections: [
          {
            name: "w3",
            type: "web3",
            endpoints: ["ws://127.0.0.1:9944"],
          },
          {
            name: "mb",
            type: "polkadotJs",
            endpoints: ["ws://127.0.0.1:9944"],
          },
        ],
      },
      {
        name: "web3_test",
        testFileDir: ["tests/web3_test/"],
        foundation: {
          type: "read_only",
        },
        connections: [
          {
            name: "w3",
            type: "web3",
            endpoints: ["wss://moonbeam.api.onfinality.io/public-ws"],
          },
        ],
      },
      {
        name: "eth_test",
        testFileDir: ["tests/eth_test/"],
        include: ["**/{test,spec,test_,test-}*{ts,mts,cts}"],
        foundation: {
          type: "read_only",
        },
        connections: [
          {
            name: "eth",
            type: "ethers",
            endpoints: ["wss://moonbeam.api.onfinality.io/public-ws"],
          },
        ],
      },
      {
        name: "dev_test",
        testFileDir: ["tests/dev_tests"],
        foundation: {
          type: "dev",
          launchSpec: [
            {
              name: "moonbeam",
              binPath: "./tmp/moonbeam",
              ports: { p2pPort: 30333, wsPort: 9944, rpcPort: 9933 },
              options: [
                "--dev",
                "--no-hardware-benchmarks",
                "--no-telemetry",
                "--reserved-only",
                "--rpc-cors=all",
                "--no-grandpa",
                "--sealing=manual",
                "--force-authoring",
                "--no-prometheus",
              ],
            },
          ],
        },
        connections: [
          {
            name: "eth",
            type: "ethers",
            endpoints: ["ws://127.0.0.1:9944"],
          },
          {
            name: "w3",
            type: "web3",
            endpoints: ["ws://127.0.0.1:9944"],
          },
          {
            name: "pjs",
            type: "moon",
            endpoints: ["ws://127.0.0.1:9944"],
          },
        ],
      },
    ],
  };
}
