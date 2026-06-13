import app from './app';
import config from './config/config';

app.listen(config.port, () => {
  console.log(`[${config.serviceName}] Running on http://localhost:${config.port}`);
  console.log(`[${config.serviceName}] Health check → http://localhost:${config.port}/health`);
  console.log(`[${config.serviceName}] Swagger UI   → http://localhost:${config.port}/api-docs`);
});
