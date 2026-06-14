const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  paymentServiceUrl: process.env.PAYMENT_SERVICE_URL ?? 'http://localhost:3002',
  serviceName: 'order-service',
};

export default config;
