// Simulate random delays and errors for realistic request patterns
export const simulateRequest = async () => {
  // 80% of requests will be between 20ms and 1000ms
  // 20% of requests will be between 1000ms and 2500ms
  const isSlowRequest = Math.random() < 0.2;
  const delay = isSlowRequest
    ? Math.floor(Math.random() * (2500 - 1000 + 1)) + 1000
    : Math.floor(Math.random() * (1000 - 20 + 1)) + 20;
  
  // Simulate different types of errors
  const errorTypes = [
    { type: 'timeout', message: 'Request timeout' },
    { type: 'database', message: 'Database connection error' },
    { type: 'validation', message: 'Invalid input data' },
    { type: 'auth', message: 'Authentication failed' },
    { type: 'server', message: 'Internal server error' }
  ];

  await new Promise(resolve => setTimeout(resolve, delay));

  // 15% chance to throw an error
  if (Math.random() < 0.15) {
    const randomError = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    throw new Error(randomError.message);
  }

  return {
    status: 'success',
    delay,
    isSlowRequest,
    timestamp: new Date().toISOString()
  };
};
