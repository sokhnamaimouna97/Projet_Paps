const log4js = require('log4js');

log4js.configure({
  appenders: {
    console: { type: 'console' },
    file: {
      type: 'file',
      filename: 'logs/app.log',
      maxLogSize: 10485760, // 10MB
      backups: 3,
      compress: true
    },
    http: { type: 'file', filename: 'logs/http.log' },
    cron: { type: 'file', filename: 'logs/cron.log' },
    bug: { 
      type: 'file', 
      filename: 'logs/bug-report.log',
      layout: {
        type: 'pattern',
        pattern: '[%d] %m%n' // %d = date, %m = message, %n = nouvelle ligne
      }
    }
  },
  categories: {
    default: { appenders: ['console', 'file'], level: 'debug' },
    http: { appenders: ['http'], level: 'info' },
    cron: { appenders: ['cron'], level: 'info' },
    bug: { appenders: ['bug'], level: 'error' }
  }
});

module.exports = log4js;