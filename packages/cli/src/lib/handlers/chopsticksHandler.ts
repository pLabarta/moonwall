import { ChopsticksBlockCreation, ChopsticksContext, FoundationHandler } from "@moonwall/types";
import {
  createChopsticksBlock,
  sendSetStorageRequest
} from "../../internal/foundations/chopsticksHelpers";
import { upgradeRuntimeChopsticks } from "../upgradeProcedures";
import { MoonwallContext } from "../globalContext";

export const chopsticksHandler: FoundationHandler<"chopsticks"> = ({
  testCases,
  context,
  testCase,
  logger,
}) => {
  const accountTypeLookup = () => {
    const metadata = ctx.polkadotJs().runtimeMetadata.asLatest;
    const systemPalletIndex = metadata.pallets.findIndex(
      (pallet) => pallet.name.toString() === "System"
    );
    const systemAccountStorageType = metadata.pallets[systemPalletIndex].storage
      .unwrap()
      .items.find((storage) => storage.name.toString() === "Account")!.type;

    return metadata.lookup.getTypeDef(systemAccountStorageType.asMap.key).type;
  };

  const newKeyring = () => {
    const isEth = accountTypeLookup() == "AccountId20";
    const keyring = new Keyring({
      type: isEth ? "ethereum" : "sr25519",
    });
    return {
      alice: keyring.addFromUri(isEth ? ALITH_PRIVATE_KEY : "//Alice", { name: "Alice default" }),
      bob: keyring.addFromUri(isEth ? BALTATHAR_PRIVATE_KEY : "//Bob", { name: "Bob default" }),
      charlie: keyring.addFromUri(isEth ? CHARLETH_PRIVATE_KEY : "//Charlie", {
        name: "Charlie default",
      }),
      dave: keyring.addFromUri(isEth ? DOROTHY_PRIVATE_KEY : "//Dave", { name: "Dave default" }),
    };
  };

  let ctx = {
    ...context,
    get isEthereumChain() {
      return accountTypeLookup() === "AccountId20";
    },
    get isSubstrateChain() {
      return accountTypeLookup() === "AccountId32";
    },
    get pjsApi() {
      return context.polkadotJs();
    },

    get keyring() {
      return newKeyring();
    },

    createBlock: async (options: ChopsticksBlockCreation = {}) =>
      await createChopsticksBlock(context, options),
    setStorage: async (params?: {
      providerName?: string;
      module: string;
      method: string;
      methodParams: any[];
    }) => await sendSetStorageRequest(params),

    upgradeRuntime: async () => {
      await upgradeRuntimeChopsticks(ctx, (() => MoonwallContext.getContext().rtUpgradePath!)());
    },
  } satisfies ChopsticksContext;

  testCases({
    context: ctx,
    it: testCase,
    log: logger(),
  });
};
