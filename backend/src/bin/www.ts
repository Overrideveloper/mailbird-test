import http from 'http';
import { AddressInfo } from 'net';
import { Server } from '../server';
import { Configuration } from '../common/configuration.common';
import { PORT_FALLBACK } from '../constants/configuration.constants';

// Create new REST server instance
const server = new Server();
// Create new HTTP server with the server instance
const httpServer = http.createServer(server.instance);
// Start the server
httpServer.listen(parseInt(Configuration.getValue('PORT', PORT_FALLBACK)), () =>
  console.log(`Server is listening on port ${(httpServer.address() as AddressInfo).address}`),
);
