import passport from 'passport';

/**
 * Middleware para autenticación usando la estrategia 'current'
 * Debe usarse antes de otros middlewares que necesiten req.user
 */
export const authenticate = passport.authenticate('current', { session: false });

/**
 * Middleware para autorizar roles específicos
 * @param {...string} allowedRoles - Roles permitidos
 */
export function authorizeRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'No autorizado: se requiere autenticación' });
    }

    const userRole = req.user.role;
    if (!userRole || !allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'No autorizado: rol insuficiente' });
    }

    next();
  };
}

/**
 * Middleware combinado: autenticación + autorización de roles
 * @param {...string} allowedRoles - Roles permitidos
 */
export function requireAuth(...allowedRoles) {
  return [
    authenticate,
    ...(allowedRoles.length > 0 ? [authorizeRoles(...allowedRoles)] : [])
  ];
}

/**
 * Middleware específico: solo administradores
 */
export const requireAdmin = [
  authenticate,
  authorizeRoles('admin')
];

/**
 * Middleware específico: solo usuarios regulares
 */
export const requireUser = [
  authenticate,
  authorizeRoles('user')
];




