require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const routes = require("./routes/Routes");

const { 
    httpLogger, 
    logDetailedRequest,
    logCriticalError,
    logSuccess
} = require('./utils/logger');

const app = express();

// Configuration de base
connectDB();
app.use(cors());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan("combined"));

// Logging HTTP
app.use(require('./config/log4js').connectLogger(httpLogger, {
  level: 'auto',
  format: ':remote-addr :method :url :status :response-timems'
}));

// Middleware de logging détaillé
app.use((req, res, next) => {
    const startTime = Date.now();
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(body) {
        const duration = Date.now() - startTime;
        logDetailedRequest(req, res, duration, {
            responseSize: Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body || {})),
            responsePreview: typeof body === 'string' 
                ? body.substring(0, 100) 
                : JSON.stringify(body || {}).substring(0, 100)
        });
        return originalSend.call(this, body);
    };
    
    res.json = function(body) {
        const duration = Date.now() - startTime;
        logDetailedRequest(req, res, duration, {
            responseSize: Buffer.byteLength(JSON.stringify(body || {})),
            responseData: body
        });
        return originalJson.call(this, body);
    };
    
    next();
});

// Routes
app.use("/api", routes);

app.get('/', (req, res) => {
    logSuccess('HOME_PAGE_ACCESS', null, {
        ip: req.ip,
        userAgent: req.get('User-Agent')
    });
    res.json({ message: 'API is running' });
});

// Gestion des erreurs 404
app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} non trouvée`);
    error.status = 404;
    next(error);
});

// Middleware principal de gestion d'erreurs
app.use((err, req, res, next) => {
    // Log de l'erreur
    logCriticalError(err, req, {
        middleware: 'ERROR_HANDLER',
        timestamp: new Date().toISOString()
    });
    
    // Réponse au client
    if (!res.headersSent) {
        const responsePayload = {
            success: false,
            error: {
                message: err.message || 'Une erreur est survenue',
                status: err.status || 500,
                timestamp: new Date().toISOString(),
                ...(err.details && { details: err.details })
            },
            // Détails debug en développement uniquement
            ...(process.env.NODE_ENV !== 'production' && {
                debug: {
                    stack: err.stack,
                    url: req.originalUrl,
                    method: req.method,
                    user: req.user || 'Non authentifié',
                    body: req.body,
                    query: req.query,
                    params: req.params
                }
            })
        };

        res.status(err.status || 500).json(responsePayload);
    }
});

// Démarrage du serveur
const port = process.env.PORT || 5000;

app.listen(port, () => {
    logSuccess('SERVER_START', null, {
        port,
        env: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
        uptime: process.uptime()
    });
});

// Gestion des erreurs globales
process.on('uncaughtException', (err) => {
    logCriticalError(err, null, { type: 'UNCAUGHT_EXCEPTION' });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logCriticalError(new Error(reason), null, { type: 'UNHANDLED_REJECTION' });
});