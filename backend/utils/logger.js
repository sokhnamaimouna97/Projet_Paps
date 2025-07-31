const log4js = require('../config/log4js');

// Créer tous les loggers
const logger = log4js.getLogger(); // général
const httpLogger = log4js.getLogger('http'); // requêtes HTTP
const bugLogger = log4js.getLogger('bug'); // erreurs critiques
const detailedLogger = log4js.getLogger('detailed'); // logs détaillés
const userErrorsLogger = log4js.getLogger('userErrors'); // erreurs utilisateur
const successLogger = log4js.getLogger('success'); // opérations réussies

// Fonctions utilitaires pour logger différents types d'événements
const logSuccess = (operation, user, details = {}) => {
    const logData = {
        operation,
        user: user ? `${user.email} (${user.id})` : 'Système',
        timestamp: new Date().toISOString(),
        ...details
    };
    
    successLogger.info(JSON.stringify(logData));
    console.log(`✅ ${operation} - ${logData.user}`);
};

const logUserError = (error, user, req = null) => {
    const logData = {
        error: error.message,
        user: user ? `${user.email} (${user.id})` : 'Non authentifié',
        url: req ? `${req.method} ${req.originalUrl}` : 'N/A',
        timestamp: new Date().toISOString(),
        body: req ? req.body : null,
        type: 'USER_ERROR'
    };
    
    userErrorsLogger.error(JSON.stringify(logData));
    console.error(`❌ Erreur utilisateur: ${error.message} - ${logData.user}`);
};

const logDetailedRequest = (req, res, duration, additionalData = {}) => {
    const logData = {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: `${duration}ms`,
        user: req.user ? `${req.user.email} (${req.user.id})` : 'Non authentifié',
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        timestamp: new Date().toISOString(),
        body: req.body,
        query: req.query,
        params: req.params,
        ...additionalData
    };
    
    detailedLogger.info(JSON.stringify(logData, null, 2));
    
    // Log aussi dans la console avec un format condensé
    const statusIcon = res.statusCode >= 400 ? '❌' : '✅';
    console.log(`${statusIcon} ${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms) - ${logData.user}`);
};

const logCriticalError = (error, req = null, additionalContext = {}) => {
    const logData = {
        error: {
            message: error.message,
            stack: error.stack,
            name: error.name
        },
        request: req ? {
            method: req.method,
            url: req.originalUrl,
            user: req.user ? `${req.user.email} (${req.user.id})` : 'Non authentifié',
            ip: req.ip || req.connection.remoteAddress,
            headers: req.headers,
            body: req.body,
            query: req.query,
            params: req.params
        } : null,
        timestamp: new Date().toISOString(),
        context: additionalContext,
        type: 'CRITICAL_ERROR'
    };
    
    bugLogger.error(JSON.stringify(logData, null, 2));
    
    console.error('💥 ERREUR CRITIQUE:', {
        message: error.message,
        url: req ? `${req.method} ${req.originalUrl}` : 'N/A',
        user: req?.user?.email || 'Non authentifié'
    });
};

// Fonction pour logger les authentifications
const logAuthentication = (type, user, success, details = {}) => {
    const logData = {
        type, // 'LOGIN', 'SIGNUP', 'TOKEN_VERIFY', etc.
        user: user ? `${user.email} (${user.id || 'nouveau'})` : 'Inconnu',
        success,
        timestamp: new Date().toISOString(),
        ...details
    };
    
    if (success) {
        successLogger.info(`AUTH_${type}: ${JSON.stringify(logData)}`);
        console.log(`🔐 ${type} réussi - ${logData.user}`);
    } else {
        userErrorsLogger.error(`AUTH_${type}_FAILED: ${JSON.stringify(logData)}`);
        console.error(`🔒 ${type} échoué - ${logData.user}`);
    }
};

// Fonction pour logger les opérations CRUD
const logCRUDOperation = (operation, entity, user, success, details = {}) => {
    const logData = {
        operation, // 'CREATE', 'READ', 'UPDATE', 'DELETE'
        entity, // 'PRODUCT', 'CATEGORY', 'USER'
        user: user ? `${user.email} (${user.id})` : 'Système',
        success,
        timestamp: new Date().toISOString(),
        ...details
    };
    
    if (success) {
        successLogger.info(`${operation}_${entity}: ${JSON.stringify(logData)}`);
        console.log(`📝 ${operation} ${entity} réussi - ${logData.user}`);
    } else {
        userErrorsLogger.error(`${operation}_${entity}_FAILED: ${JSON.stringify(logData)}`);
        console.error(`📝 ${operation} ${entity} échoué - ${logData.user}`);
    }
};

module.exports = { 
    logger, 
    httpLogger, 
    bugLogger, 
    detailedLogger,
    userErrorsLogger,
    successLogger,
    
    // Fonctions utilitaires
    logSuccess,
    logUserError,
    logDetailedRequest,
    logCriticalError,
    logAuthentication,
    logCRUDOperation
};