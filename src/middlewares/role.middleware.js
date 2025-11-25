export function authorizeRoles(...allowedRoles) {
    return (req, res, next) => {
      const role = req.user?.role;
      if (!role || !allowedRoles.includes(role)) {
        return res.status(403).json({ error: 'No autorizado: rol insuficiente' });
      }
      next();
    };
  }
  