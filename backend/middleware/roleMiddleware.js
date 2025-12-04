module.exports = function (...allowedRoles) {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;
      if (!userRole) {
        return res.status(401).json({ msg: 'Unauthorized: no role found' });
      }
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ msg: 'Access denied' });
      }
      next();
    } catch (err) {
      console.error('Role middleware error:', err);
      return res.status(500).json({ msg: 'Server error' });
    }
  };
}