const fs = require('fs');
const path = require('path');
const { bugLogger } = require('./logger');

const logAllRequests = (req, res, next) => {
    const startTime = Date.now();
    
    // Intercepter la réponse pour capturer le status code
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(body) {
        logRequestResponse(req, res, body, startTime);
        return originalSend.call(this, body);
    };
    
    res.json = function(body) {
        logRequestResponse(req, res, body, startTime);
        return originalJson.call(this, body);
    };
    
    next();
};

function logRequestResponse(req, res, body, startTime) {
    const timestamp = new Date().toISOString();
    const duration = Date.now() - startTime;
    const method = req.method;
    const url = req.originalUrl;
    const statusCode = res.statusCode;
    const user = req.user ? `${req.user._id} (${req.user.email})` : 'Non authentifié';
    
    const requestInfo = {
        timestamp,
        method,
        url,
        statusCode,
        user,
        duration: `${duration}ms`,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params
    };
    
    // Log dans le fichier spécialisé pour toutes les requêtes
    const logPath = path.join(__dirname, '../logs/all-requests.log');
    const logEntry = `
===============================
[${timestamp}] ${method} ${url} - ${statusCode} (${duration}ms)
User: ${user}
Headers: ${JSON.stringify(req.headers, null, 2)}
Body: ${JSON.stringify(req.body, null, 2)}
Response: ${typeof body === 'string' ? body.substring(0, 200) : JSON.stringify(body || {}).substring(0, 200)}
===============================
`;
    
    // Écriture asynchrone pour ne pas bloquer
    fs.appendFile(logPath, logEntry, (writeErr) => {
        if (writeErr) {
            console.error("❌ Erreur lors de l'écriture du log toutes requêtes:", writeErr);
        }
    });
    
    // Log aussi avec log4js
    bugLogger.info('Request:', JSON.stringify(requestInfo, null, 2));
    
    // Console pour debug
    console.log(`📝 ${method} ${url} - ${statusCode} (${duration}ms)`);
}

module.exports = logAllRequests;

/* const fs = require('fs');
const path = require('path');
const { bugLogger, httpLogger } = require('./logger');

const logAllRequests = (req, res, next) => {
    const startTime = Date.now();
    
    // Intercepter la réponse pour capturer le status code
    const originalSend = res.send;
    const originalJson = res.json;
    
    res.send = function(body) {
        logRequestResponse(req, res, body, startTime);
        return originalSend.call(this, body);
    };
    
    res.json = function(body) {
        logRequestResponse(req, res, body, startTime);
        return originalJson.call(this, body);
    };
    
    next();
};

function logRequestResponse(req, res, body, startTime) {
    const timestamp = new Date().toISOString();
    const duration = Date.now() - startTime;
    
    // Créer l'objet JSON complet
    const logData = {
        timestamp,
        method: req.method,
        url: req.originalUrl,
        statusCode: res.statusCode,
        duration: duration, // en millisecondes
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        user: req.user ? {
            id: req.user._id,
            email: req.user.email
        } : null,
        request: {
            headers: req.headers,
            body: req.body,
            query: req.query,
            params: req.params
        },
        response: {
            size: Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body || {})),
            preview: typeof body === 'string' 
                ? body.substring(0, 200) 
                : JSON.stringify(body || {}).substring(0, 200)
        }
    };
    
    // Créer le dossier logs s'il n'existe pas
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // Écriture en JSON (une ligne par requête pour faciliter le parsing)
    const logPath = path.join(logsDir, 'all-requests.json');
    const logEntry = JSON.stringify(logData) + '\n';
    
    // Écriture asynchrone pour ne pas bloquer
    fs.appendFile(logPath, logEntry, (writeErr) => {
        if (writeErr) {
            console.error("❌ Erreur lors de l'écriture du log toutes requêtes:", writeErr);
        }
    });
    
    // Log aussi avec log4js dans un format structuré
    httpLogger.info('Request', logData);
    
    // Console pour debug avec un format condensé
    console.log(`📝 ${logData.method} ${logData.url} - ${logData.statusCode} (${duration}ms)`);
}

module.exports = logAllRequests; */