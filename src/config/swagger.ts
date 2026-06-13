import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Payment Service API',
      version: '1.0.0',
      description: 'Nexagent e-commerce — Payment microservice',
    },
    servers: [{ url: 'http://localhost:3002', description: 'Local dev' }],
    components: {
      schemas: {
        Payment: {
          type: 'object',
          properties: {
            id:            { type: 'string', format: 'uuid' },
            orderId:       { type: 'string', example: 'order-uuid' },
            amount:        { type: 'number', example: 999.99 },
            currency:      { type: 'string', example: 'USD' },
            status:        { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] },
            failureReason: { type: 'string', example: 'Insufficient funds' },
            createdAt:     { type: 'string', format: 'date-time' },
            updatedAt:     { type: 'string', format: 'date-time' },
          },
        },
        CreatePaymentRequest: {
          type: 'object',
          required: ['orderId', 'amount'],
          properties: {
            orderId:  { type: 'string', example: 'order-uuid' },
            amount:   { type: 'number', minimum: 0.01, example: 999.99 },
            currency: { type: 'string', minLength: 3, maxLength: 3, example: 'USD', default: 'USD' },
          },
        },
        PaymentStatusResponse: {
          type: 'object',
          properties: {
            id:     { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] },
          },
        },
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data:    { },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error:   { type: 'string' },
            message: { type: 'string' },
          },
        },
      },
    },
    paths: {
      '/health': {
        get: {
          tags: ['Health'],
          summary: 'Health check',
          responses: {
            200: {
              description: 'Service is healthy',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      status:    { type: 'string', example: 'ok' },
                      service:   { type: 'string', example: 'payment-service' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/payments': {
        post: {
          tags: ['Payments'],
          summary: 'Initiate a payment for an order (status starts as PENDING, resolves async)',
          requestBody: {
            required: true,
            content: {
              'application/json': { schema: { $ref: '#/components/schemas/CreatePaymentRequest' } },
            },
          },
          responses: {
            201: {
              description: 'Payment initiated — poll GET /payments/:id to see final status',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
            400: { description: 'Validation error' },
          },
        },
        get: {
          tags: ['Payments'],
          summary: 'List all payments',
          parameters: [
            {
              in: 'query', name: 'status',
              schema: { type: 'string', enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'] },
              description: 'Filter by status',
            },
            {
              in: 'query', name: 'orderId',
              schema: { type: 'string' },
              description: 'Filter by order ID',
            },
          ],
          responses: {
            200: {
              description: 'List of payments',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
          },
        },
      },
      '/payments/{id}': {
        get: {
          tags: ['Payments'],
          summary: 'Get full payment details',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'Payment details',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
            404: { description: 'Payment not found' },
          },
        },
      },
      '/payments/{id}/status': {
        get: {
          tags: ['Payments'],
          summary: 'Get payment status — lightweight, returns only { id, status }',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'Payment status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/PaymentStatusResponse' },
                    },
                  },
                },
              },
            },
            404: { description: 'Payment not found' },
          },
        },
      },
      '/payments/{id}/refund': {
        post: {
          tags: ['Payments'],
          summary: 'Refund a successful payment (SUCCESS → REFUNDED)',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Payment refunded' },
            404: { description: 'Payment not found' },
            422: { description: 'Payment is not in SUCCESS status' },
          },
        },
      },
      '/payments/{id}/retry': {
        post: {
          tags: ['Payments'],
          summary: 'Retry a failed payment (FAILED → PENDING → SUCCESS/FAILED)',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Payment retry initiated — poll GET /payments/:id/status for result' },
            404: { description: 'Payment not found' },
            422: { description: 'Payment is not in FAILED status' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
