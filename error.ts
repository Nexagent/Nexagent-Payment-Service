import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Order Service API',
      version: '1.0.0',
      description: 'Nexagent e-commerce — Order microservice',
    },
    servers: [{ url: 'http://localhost:3001', description: 'Local dev' }],
    components: {
      schemas: {
        OrderItem: {
          type: 'object',
          required: ['productId', 'name', 'quantity', 'unitPrice'],
          properties: {
            productId: { type: 'string', example: 'prod-1' },
            name:      { type: 'string', example: 'Laptop' },
            quantity:  { type: 'integer', minimum: 1, example: 1 },
            unitPrice: { type: 'number', minimum: 0.01, example: 999.99 },
          },
        },
        Order: {
          type: 'object',
          properties: {
            id:          { type: 'string', format: 'uuid' },
            customerId:  { type: 'string', example: 'cust-1' },
            items:       { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            totalAmount: { type: 'number', example: 999.99 },
            status:      { type: 'string', enum: ['CREATED', 'PAID', 'SHIPPED'] },
            createdAt:   { type: 'string', format: 'date-time' },
            updatedAt:   { type: 'string', format: 'date-time' },
          },
        },
        CreateOrderRequest: {
          type: 'object',
          required: ['customerId', 'items'],
          properties: {
            customerId: { type: 'string', example: 'cust-1' },
            items: {
              type: 'array',
              minItems: 1,
              items: { $ref: '#/components/schemas/OrderItem' },
            },
          },
        },
        UpdateStatusRequest: {
          type: 'object',
          required: ['status'],
          properties: {
            status: { type: 'string', enum: ['CREATED', 'PAID', 'SHIPPED', 'CANCELLED'] },
          },
        },
        OrderStatusResponse: {
          type: 'object',
          properties: {
            id:     { type: 'string', format: 'uuid' },
            status: { type: 'string', enum: ['CREATED', 'PAID', 'SHIPPED', 'CANCELLED'] },
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
            error:   { type: 'string', example: 'OrderNotFoundError' },
            message: { type: 'string', example: 'Order with id x not found' },
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
                      service:   { type: 'string', example: 'order-service' },
                      timestamp: { type: 'string', format: 'date-time' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      '/orders': {
        post: {
          tags: ['Orders'],
          summary: 'Create a new order',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateOrderRequest' },
              },
            },
          },
          responses: {
            201: {
              description: 'Order created',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
            400: { description: 'Validation error' },
          },
        },
        get: {
          tags: ['Orders'],
          summary: 'List all orders',
          parameters: [
            {
              in: 'query',
              name: 'status',
              schema: { type: 'string', enum: ['CREATED', 'PAID', 'SHIPPED'] },
              description: 'Filter by status',
            },
            {
              in: 'query',
              name: 'customerId',
              schema: { type: 'string' },
              description: 'Filter by customer ID',
            },
          ],
          responses: {
            200: {
              description: 'List of orders',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
          },
        },
      },
      '/orders/{id}': {
        get: {
          tags: ['Orders'],
          summary: 'Get order by ID',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'Order details',
              content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } },
            },
            404: { description: 'Order not found' },
          },
        },
        delete: {
          tags: ['Orders'],
          summary: 'Cancel order — only allowed if status is CREATED',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: { description: 'Order cancelled' },
            404: { description: 'Order not found' },
            422: { description: 'Order cannot be cancelled (not in CREATED status)' },
          },
        },
      },
      '/orders/{id}/status': {
        get: {
          tags: ['Orders'],
          summary: 'Get order status — lightweight, returns only { id, status }',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          responses: {
            200: {
              description: 'Order status',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: { type: 'boolean' },
                      data: { $ref: '#/components/schemas/OrderStatusResponse' },
                    },
                  },
                },
              },
            },
            404: { description: 'Order not found' },
          },
        },
        patch: {
          tags: ['Orders'],
          summary: 'Update order status (called by Payment Service)',
          parameters: [
            { in: 'path', name: 'id', required: true, schema: { type: 'string', format: 'uuid' } },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateStatusRequest' },
              },
            },
          },
          responses: {
            200: { description: 'Status updated' },
            404: { description: 'Order not found' },
            422: { description: 'Invalid status transition' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
