require('dotenv').config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const cookieParser = require('cookie-parser');
const bodyParser = require("body-parser");
const connectDB = require("./config/db");
const routes = require("./routes/Routes");

const { 
    logger, 
    httpLogger, 
    bugLogger,
    detailedLogger,
    logDetailedRequest,
    logCriticalError,
    logSuccess
} = require('./utils/logger');

const app = express();
connectDB();
app.use(cors());

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser());
app.use(morgan("combined"));

// Log4js pour les requêtes HTTP (écrit déjà dans logs/http.log)
app.use(require('./config/log4js').connectLogger(httpLogger, {
  level: 'auto',
  format: ':remote-addr :method :url :status :response-timems'
}));

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


app.use("/api", routes);

app.get('/', (req, res) => {logSuccess('HOME_PAGE_ACCESS', null, {ip: req.ip,userAgent: req.get('User-Agent')})});


// ========================
// GESTION DES ERREURS AVEC LOGGING DANS FICHIERS
// ========================

// Middleware 404
app.use((req, res, next) => {
    const error = new Error(`Route ${req.originalUrl} non trouvée`);
    error.status = 404;
    next(error);
});

// Middleware principal de gestion d'erreurs
app.use((err, req, res, next) => {
    console.log('🚨 Middleware d\'erreur principal déclenché');
    
    // Log critique dans logs/bug-report.log
    logCriticalError(err, req, {
        middleware: 'ERROR_HANDLER',
        timestamp: new Date().toISOString()
    });
    
    // Informations détaillées de l'erreur
    const errorDetails = {
        timestamp: new Date().toISOString(),
        method: req.method,
        url: req.originalUrl,
        statusCode: err.status || 500,
        message: err.message,
        user: req.user ? {
            id: req.user.id,
            email: req.user.email,
            role: req.user.role
        } : 'Non authentifié',
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params,
        ip: req.ip || req.connection.remoteAddress
    };

    // Affichage console (plus concis)
    console.error('============================================');
    console.error('❌ ERREUR API');
    console.error(`📍 ${req.method} ${req.originalUrl}`);
    console.error(`⚠️  ${err.message}`);
    console.error(`🔢 Status: ${err.status || 500}`);
    console.error(`👤 User: ${errorDetails.user.email || 'Non authentifié'}`);
    console.error('============================================');

    // Réponse au client
    if (!res.headersSent) {
        const responsePayload = {
            success: false,
            error: {
                message: err.message || 'Une erreur est survenue',
                status: err.status || 500,
                timestamp: errorDetails.timestamp,
                ...(err.details && { details: err.details })
            },
            // En développement, envoyer plus de détails
            ...(process.env.NODE_ENV !== 'production' && {
                debug: {
                    stack: err.stack,
                    url: req.originalUrl,
                    method: req.method,
                    user: errorDetails.user,
                    body: req.body,
                    query: req.query,
                    params: req.params
                }
            })
        };

        res.status(err.status || 500).json(responsePayload);
    }
});

// ========================
// DÉMARRAGE DU SERVEUR
// ========================

const port = process.env.PORT || 5000;

app.listen(port, () => {logSuccess('SERVER_START', null, {port,env: process.env.NODE_ENV || 'development',nodeVersion: process.version,uptime: process.uptime()});
});

// Gestion des erreurs non capturées (avec logging dans fichiers)
process.on('uncaughtException', (err) => {
    console.error('💥 Erreur non capturée:', err);
    logCriticalError(err, null, { type: 'UNCAUGHT_EXCEPTION' });
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('💥 Promesse rejetée non gérée:', reason);
    logCriticalError(new Error(reason), null, { type: 'UNHANDLED_REJECTION' });
});