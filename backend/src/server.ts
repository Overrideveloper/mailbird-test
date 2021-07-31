import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import emailRouter from './routers/email.router';

/** Server */
export class Server {
  // Internal express server instance
  private app: Application;

  constructor() {
    // Create new express application instance
    this.app = express();
    // Configure server
    this.configure();
  }

  /**
   * Retrieve the internal express application instance
   */
  get instance() {
    return this.app;
  }

  /**
   * Configure internal express application instance
   * - Configure middleware
   * - Configure routing
   */
  private configure(): void {
    // Disable x-powered-by header
    // This prevents information about the type of server from being sent to the client
    this.app.disable('x-powered-by');
    // Configure parsing of JSON request bodies
    this.app.use(express.json());
    // Configure parsing of URL encoded request bodies
    this.app.use(express.urlencoded({ extended: false }));
    // Configure Cross-Origin Resource Sharing (CORS)
    this.app.use(
      cors({
        origin: true,
        methods: 'GET, POST, OPTIONS, PUT, PATCH, DELETE',
        credentials: true,
        optionsSuccessStatus: 200,
        allowedHeaders: [
          'Access-Control-Allow-Origin',
          'Authorization',
          'Origin',
          'x-requested-with',
          'Content-Type',
          'Content-Range',
          'Content-Disposition',
          'Content-Description',
        ],
      }),
    );

    // Configure routing
    this.app.use(emailRouter);
    // Configure 404 routing
    this.app.use((req: Request, res: Response) => {
      res.status(404).json({
        code: 404,
        message: `Route '${req.originalUrl}' does not exist`,
        data: null,
      });
    });
  }
}
