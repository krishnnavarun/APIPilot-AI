/**
 * Request logging middleware with analytics
 */

const requestLogs = [];

export const analyticsMiddleware = (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    const logEntry = {
      timestamp: new Date(),
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      userId: req.userId || null,
      ip: req.ip,
    };

    requestLogs.push(logEntry);

    // Keep only last 1000 logs in memory
    if (requestLogs.length > 1000) {
      requestLogs.shift();
    }
  });

  next();
};

export const getAnalytics = () => {
  const now = Date.now();
  const last24h = now - 24 * 60 * 60 * 1000;

  const recentLogs = requestLogs.filter((log) => log.timestamp.getTime() > last24h);

  const avgResponseTime =
    recentLogs.length > 0
      ? recentLogs.reduce((sum, log) => sum + log.duration, 0) / recentLogs.length
      : 0;

  const errorCount = recentLogs.filter((log) => log.statusCode >= 400).length;

  const successCount = recentLogs.filter((log) => log.statusCode < 400).length;

  return {
    totalRequests: recentLogs.length,
    successCount,
    errorCount,
    averageResponseTime: Math.round(avgResponseTime),
    requestsLast24h: recentLogs,
  };
};

export default analyticsMiddleware;
