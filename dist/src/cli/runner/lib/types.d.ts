import { ApiPromise } from "@polkadot/api";
import { WebSocketProvider } from "ethers";
import Web3 from "web3";
export type MoonwallConfig = {
    label: string;
    defaultTestTimeout: number;
    environments: Environment[];
};
export type Environment = {
    name: string;
    testFileDir: string;
    foundation: Foundation;
    connections: ProviderConfig[];
};
export type Foundation = {
    type: "production" | "dev" | "fork" | "zombie" | "chopsticks";
};
export interface ProviderConfig {
    name: string;
    type: ProviderType;
    endpoints: string[];
}
export type MoonwallEnvironment = {
    name: string;
    providers: MoonwallProvider[];
    context: any;
};
export interface MoonwallProvider {
    name: string;
    type: ProviderType;
    connect: () => Promise<ApiPromise> | Promise<WebSocketProvider> | Web3 | void;
    ws?: any;
}
export interface ConnectedProvider {
    name: string;
    api: ApiPromise | WebSocketProvider | Web3;
    disconnect: () => void;
    greet: () => Promise<void> | void;
}
export declare enum ProviderType {
    PolkadotJs,
    Ethers,
    Web3,
    Moonbeam,
    Unknown
}
export interface LaunchedNode {
}
export type MoonwallTestFile = {};
export type MoonwallTestSuite = {
    tests: MoonwallTestCase[];
};
export type MoonwallTestCase = {};
