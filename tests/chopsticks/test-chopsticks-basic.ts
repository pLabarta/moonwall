import { ApiPromise } from "@polkadot/api";
import { Foundation } from "../../src/cli/runner/lib/types.js";
import { testSuite } from "../../src/index.js";
import { expect } from "vitest";
import { parseEther } from "ethers";
import { ETHAN_ADDRESS, alith } from "../../src/cli/runner/lib/accounts.js";
import { setTimeout } from "timers/promises";
testSuite({
  id: "X1",
  title: "Basic chopsticks test",
  foundationMethods: Foundation.Chopsticks,
  testCases: ({ context, it }) => {
    let api: ApiPromise;

    beforeAll(() => {
      api = context.getMoonbeam();
    });
    it("T1", "Query the chain", async function () {
      const chainName = api.consts.system.version.specName.toString();
      const currentBlockHeight = (
        await api.rpc.chain.getHeader()
      ).number.toNumber();
      console.log(
        `You are now connected to ${chainName} at height #${currentBlockHeight}`
      );
      expect(currentBlockHeight).toBeGreaterThan(0);
      expect(chainName).toBe("moonbeam");
    });

    it("T2", "Send a transaction ", async function () {
      const currentBalance = (await api.query.system.account(ETHAN_ADDRESS))
        .data.free;
      await api.tx.balances
        .transfer(ETHAN_ADDRESS, parseEther("10"))
        .signAndSend(alith);
      await context.createBlock();

      const balanceAfter = (await api.query.system.account(ETHAN_ADDRESS)).data
        .free;
      expect(currentBalance.lt(balanceAfter)).toBeTruthy();
    });

    it("T3", "Skips multiple blocks ", async function () {
      const currentBlock = (await api.rpc.chain.getHeader()).number.toNumber();
      await context.createBlock({ count: 3 });
      const laterBlock = (await api.rpc.chain.getHeader()).number.toNumber();
      expect(laterBlock - currentBlock).toBe(3);
    });
  },
});
