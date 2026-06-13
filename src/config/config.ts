const config = {
  port: parseInt(process.env.PORT ?? '3002', 10),
  orderServiceUrl: process.env.ORDER_SERVICE_URL ?? 'http://localhost:3001',
  serviceName: 'payment-service',
};

export default config;
