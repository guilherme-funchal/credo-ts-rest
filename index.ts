import { LogLevel, type InitConfig } from "@credo-ts/core";
import {
  CredoRestAgentConfig,
  createRestAgent,
  setupApp,
} from "@credo-ts/rest";

import { readFile } from 'fs/promises'

const agentConfig = {
  label: "test-agent-ts",
  walletConfig: {
    id: "test-wallet-id-1",
    key: "testkey0000000000000000000000001",
    storage: {
      type: 'sqlite'
    }
  },
} satisfies InitConfig | CredoRestAgentConfig;

const run = async () => {
  try {
    const agent = await createRestAgent({
      ...agentConfig,
      inboundTransports: [
        {
          transport: "http",
          port: 3001,
        },
      ],
      outboundTransports: ["http"],
      logLevel: LogLevel.debug,
      endpoints: ["http://localhost:3001"],
      multiTenant: true,
      indyLedgers: [{
        isProduction: false,
        indyNamespace: 'bcovrin:test',
        genesisTransactions: await readFile('./genesis.txt', 'utf-8'),
        connectOnStartup: true
      }]
    });

    const { start } = await setupApp({
      adminPort: 3000,
      enableCors: true,
      agent,
    });

    start();
  } catch (e) {
    console.error(
      `Something went wrong while setting up the app! Message: ${e}`
    );
  }
};

run();
