const fs = require('fs');
const path = require('path');
const { bugLogger } = require('./logger');

// Version modifiée qui peut capturer TOUTES les requêtes, pas seulement les erreurs
const logBugReport = (err, req, res, next) => {
    console.log('🚨 logBugReport middleware déclenché');
    
    const timestamp = new Date().toISOString();
    const method = req.method;
    const url = req.originalUrl;
    const statusCode = err ? (err.status || 500) : res.statusCode;
    const user = req.user ? `${req.user._id} (${req.user.email})` : 'Utilisateur non authentifié';
    
    // Créer le message
    const logData = {
        timestamp,
        method,
        url,
        statusCode,
        user,
        error: err ? err.message : null,
        stack: err ? err.stack : null,
        headers: req.headers,
        body: req.body,
        query: req.query,
        params: req.params
    };

    // 1. Log dans le fichier avec bugLogger
    bugLogger.error('=== LOG REPORT ===');
    bugLogger.error(JSON.stringify(logData, null, 2));
    bugLogger.error('==================');
    
    // 2. Log dans la console pour debug
    console.error('🐛 Report complet:', logData);
    
    // 3. Écriture directe dans le fichier
    const logPath = path.join(__dirname, '../logs/bug-report.log');
    const logEntry = `
===============================
[${timestamp}]
URL: ${url}
Méthode: ${method}
Status: ${statusCode}
Utilisateur: ${user}
${err ? `Erreur: ${err.message}` : 'Succès'}
${err ? `Stack: ${err.stack || 'N/A'}` : ''}
===============================
`;
    
    fs.appendFile(logPath, logEntry, (writeErr) => {
        if (writeErr) {
            console.error("❌ Erreur lors de l'écriture du log:", writeErr);
        } else {
            console.log("✅ Log écrit avec succès dans", logPath);
        }
    });

    // Envoyer la réponse seulement s'il y a une erreur
    if (err && !res.headersSent) {
        res.status(statusCode).json({
            message: "Une erreur s'est produite.",
            error: process.env.NODE_ENV === 'production' ? undefined : err.message,
            timestamp: timestamp
        });
    } else if (!err) {
        // Si pas d'erreur, continuer normalement
        next();
    }
};

module.exports = logBugReport;

/* const fs = require('fs');
const path = require('path');
const { bugLogger } = require('./logger');

const logBugReport = (err, req, res, next) => {
    console.log('🚨 logBugReport middleware déclenché');
    
    const timestamp = new Date().toISOString();
    
    // Créer l'objet JSON complet pour l'erreur
    const logData = {
        timestamp,
        type: 'error',
        method: req.method,
        url: req.originalUrl,
        statusCode: err ? (err.status || 500) : res.statusCode,
        user: req.user ? {
            id: req.user._id,
            email: req.user.email
        } : null,
        error: err ? {
            message: err.message,
            stack: err.stack,
            name: err.name
        } : null,
        request: {
            headers: req.headers,
            body: req.body,
            query: req.query,
            params: req.params,
            ip: req.ip || req.connection.remoteAddress,
            userAgent: req.get('User-Agent'),
            referer: req.get('Referer')
        },
        server: {
            nodeVersion: process.version,
            platform: process.platform,
            memory: process.memoryUsage(),
            uptime: process.uptime()
        }
    };

    // Créer le dossier logs s'il n'existe pas
    const logsDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logsDir)) {
        fs.mkdirSync(logsDir, { recursive: true });
    }
    
    // 1. Log dans le fichier JSON (une ligne par erreur)
    const jsonLogPath = path.join(logsDir, 'bug-report.json');
    const jsonLogEntry = JSON.stringify(logData) + '\n';
    
    fs.appendFile(jsonLogPath, jsonLogEntry, (writeErr) => {
        if (writeErr) {
            console.error("❌ Erreur lors de l'écriture du log JSON:", writeErr);
        } else {
            console.log("✅ Log JSON écrit avec succès");
        }
    });
    
    // 2. Log avec log4js (format structuré)
    bugLogger.error('Bug Report', logData);
    
    // 3. Log dans la console pour debug
    console.error('🐛 Bug Report complet:', {
        url: logData.url,
        method: logData.method,
        status: logData.statusCode,
        error: logData.error?.message,
        timestamp: logData.timestamp
    });

    // Envoyer la réponse
    if (err && !res.headersSent) {
        res.status(logData.statusCode).json({
            success: false,
            message: "Une erreur s'est produite.",
            error: process.env.NODE_ENV === 'production' ? undefined : logData.error?.message,
            timestamp: logData.timestamp,
            requestId: req.headers['x-request-id'] || 'unknown'
        });
    }
};

module.exports = logBugReport; */