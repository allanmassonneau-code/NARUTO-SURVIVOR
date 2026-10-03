import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PVP_PORT } from '../src/net/protocol';
import { createPvpServer } from './app';

const here = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT ?? PVP_PORT);
const dataDir = process.env.DATA_DIR ?? path.join(here, 'data');

const server = await createPvpServer({ port, dataDir });
console.log(
  `Serveur PvP Shinobi Clash : ws://localhost:${server.port} (classement : http://localhost:${server.port}/leaderboard)`,
);

const shutdown = () => void server.close().then(() => process.exit(0));
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
