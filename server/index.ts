import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { testSupabaseConnection } from "./lib/supabase";
import { initializeWebSocket } from "./websocket";
import { AuthService } from "./auth/authService";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

async function createDemoUsersIfNeeded() {
  try {
    // Try to create owner user
    const ownerResult = await AuthService.register({
      username: 'owner',
      email: 'owner@demo.com',
      password: 'owner123',
      name: 'Demo Owner',
      phone: '555-0001',
      role: 'owner',
      restaurantId: 1
    });

    if (ownerResult.success) {
      log('✅ Demo owner user created (username: owner, password: owner123)');
    }

    // Try to create customer user
    const customerResult = await AuthService.register({
      username: 'customer',
      email: 'customer@demo.com',
      password: 'customer123',
      name: 'Demo Customer',
      phone: '555-0002',
      role: 'customer'
    });

    if (customerResult.success) {
      log('✅ Demo customer user created (username: customer, password: customer123)');
    }
  } catch (error) {
    // Silently fail - users might already exist
    log('Demo users already exist or database not ready');
  }
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Test Supabase connection
  const isConnected = await testSupabaseConnection();
  if (!isConnected) {
    log("⚠️  Warning: Supabase connection test failed. Some features may not work.");
  }

  // Create demo users on startup
  await createDemoUsersIfNeeded();

  const server = await registerRoutes(app);
  
  // Initialize WebSocket server
  const wsManager = initializeWebSocket(server);
  log("WebSocket server initialized");

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Serve the app on port 5000 by default, but allow override with PORT env var
  // this serves both the API and the client.
  const port = process.env.PORT ? parseInt(process.env.PORT) : 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
