import { exec, spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import WebSocket from "ws";
import { checkAccess, checkExists } from "./fileCheckers";
import Debug from "debug";
import { setTimeout as timer } from "node:timers/promises";
import util from "node:util";

const execAsync = util.promisify(exec);
const debug = Debug("global:localNode");

export async function launchNode(cmd: string, args: string[], name: string) {
  if (cmd.includes("moonbeam")) {
    await checkExists(cmd);
    checkAccess(cmd);
  }

  const port = args.find((a) => a.includes("port"))?.split("=")[1];
  debug(`\x1b[36mStarting ${name} node on port ${port}...\x1b[0m`);

  const dirPath = path.join(process.cwd(), "tmp", "node_logs");

  const runningNode = spawn(cmd, args);

  const logLocation = path
    .join(
      dirPath,
      `${path.basename(cmd)}_node_${args.find((a) => a.includes("port"))?.split("=")[1]}_${
        runningNode.pid
      }.log`
    )
    .replaceAll("node_node_undefined", "chopsticks");

  process.env.MOON_LOG_LOCATION = logLocation;

  const fsStream = fs.createWriteStream(logLocation);

  runningNode.on("error", (err) => {
    if ((err as any).errno === "ENOENT") {
      console.error(`\x1b[31mMissing Local binary at(${cmd}).\nPlease compile the project\x1b[0m`);
    }
    throw new Error(err.message);
  });

  const logHandler = (chunk: any) => {
    if (fsStream.writable) {
      fsStream.write(chunk, (err) => {
        if (err) console.error(err);
        else fsStream.emit("drain");
      });
    }
  };

  runningNode.stderr?.on("data", logHandler);
  runningNode.stdout?.on("data", logHandler);

  runningNode.once("exit", () => {
    fsStream.end();
    runningNode.stderr?.removeListener("data", logHandler);
    runningNode.stdout?.removeListener("data", logHandler);
  });

  if (!runningNode.pid) {
    const errorMessage = "Failed to start child process";
    console.error(errorMessage);
    fs.appendFileSync(logLocation, `${errorMessage}\n`);
    throw new Error(errorMessage);
  }

  // Check if the process exited immediately
  if (runningNode.exitCode !== null) {
    const errorMessage = `Child process exited immediately with code ${runningNode.exitCode}`;
    console.error(errorMessage);
    fs.appendFileSync(logLocation, `${errorMessage}\n`);
    throw new Error(errorMessage);
  }

  const isRunning = await isPidRunning(runningNode.pid);

  if (!isRunning) {
    const errorMessage = `Process with PID ${runningNode.pid} is not running`;
    spawnSync(cmd, args, { stdio: "inherit" });
    throw new Error(errorMessage);
  }

  probe: for (let i = 0; ; i++) {
    try {
      const ports = await findPortsByPid(runningNode.pid);
      if (ports) {
        for (const port of ports) {
          try {
            await checkWebSocketJSONRPC(port);
            // console.log(`Port ${port} supports WebSocket JSON RPC!`);
            break probe;
          } catch {}
        }
      }
    } catch {
      if (i === 300) {
        throw new Error("Could not find ports for node after 30 seconds");
      }
      await timer(100);
      continue;
    }
    await timer(100);
  }

  return { runningNode, fsStream };
}

function isPidRunning(pid: number): Promise<boolean> {
  return new Promise((resolve) => {
    exec(`ps -p ${pid} -o pid=`, (error, stdout, stderr) => {
      if (error) {
        resolve(false);
      } else {
        resolve(stdout.trim() !== "");
      }
    });
  });
}

async function checkWebSocketJSONRPC(port: number): Promise<boolean> {
  try {
    const ws = new WebSocket(`ws://localhost:${port}`);

    const result: boolean = await new Promise((resolve) => {
      ws.on("open", () => {
        ws.send(
          JSON.stringify({
            jsonrpc: "2.0",
            id: 1,
            method: "system_chain",
            params: [],
          })
        );
      });

      ws.on("message", (data) => {
        try {
          const response = JSON.parse(data.toString());
          if (response.jsonrpc === "2.0" && response.id === 1) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (e) {
          resolve(false);
        }
      });

      ws.on("error", () => {
        resolve(false);
      });
    });

    ws?.close();
    return result;
  } catch {
    return false;
  }
}

async function findPortsByPid(pid: number, retryCount = 600, retryDelay = 100): Promise<number[]> {
  for (let i = 0; i < retryCount; i++) {
    try {
      const { stdout } = await execAsync(`lsof -p ${pid} -n -P | grep LISTEN`);
      const ports: number[] = [];
      const lines = stdout.split("\n");
      for (const line of lines) {
        // Example outputs:
        // - lsof node      97796 romarq   26u  IPv6 0xb6c3e894a2247189      0t0  TCP *:8000 (LISTEN)
        // - lsof node      97242 romarq   26u  IPv6 0x330c461cca8d2b63      0t0  TCP [::1]:8000 (LISTEN)
        const regex = /(?:.+):(\d+)/;
        const match = line.match(regex);
        if (match) {
          ports.push(Number(match[1]));
        }
      }

      if (ports.length) {
        return ports;
      }
      throw new Error("Could not find any ports");
    } catch (error) {
      if (i === retryCount - 1) {
        throw error;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, retryDelay));
  }

  return [];
}
