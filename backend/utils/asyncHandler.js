const { bugLogger } = require('./logger');

// Middleware pour capturer automatiquement les erreurs async/await
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error('🔥 Erreur capturée par asyncHandler:', {
            message: error.message,
            stack: error.stack,
            url: req.originalUrl,
            method: req.method,
            user: req.user?.email || 'Non authentifié'
        });
        
        // Log l'erreur avant de la transmettre
        bugLogger.error('AsyncHandler Error:', {
            error: error.message,
            stack: error.stack,
            url: req.originalUrl,
            method: req.method,
            timestamp: new Date().toISOString()
        });
        
        next(error);
    });
};

// Version avec détails supplémentaires pour les erreurs de base de données
const asyncHandlerDB = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((error) => {
        console.error('🔥 Erreur DB capturée:', {
            message: error.message,
            code: error.code,
            name: error.name,
            url: req.originalUrl,
            method: req.method
        });
        
        // Transformer les erreurs MongoDB en messages plus clairs
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            error.message = `Erreur de validation: ${messages.join(', ')}`;
            error.status = 400;
        } else if (error.code === 11000) {
            error.message = 'Cette donnée existe déjà';
            error.status = 409;
        } else if (error.name === 'CastError') {
            error.message = 'ID invalide';
            error.status = 400;
        }
        
        next(error);
    });
};

module.exports = { asyncHandler, asyncHandlerDB };