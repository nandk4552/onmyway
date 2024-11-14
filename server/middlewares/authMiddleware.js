const roleMiddleware = (roles) => {
  return (req, res, next) => {
    // Check if the user is authenticated
    if (!req.user) {
      return res.status(403).json({ message: "Access denied. No user found." });
    }

    // Check if the user's role is included in the roles array
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ message: "Access denied. Insufficient permissions." });
    }

    next(); // Proceed to the next middleware or route handler
  };
};
const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    return next();
  }
  return res.status(403).send({
    success: false,
    message: "Access denied, Admins only.",
  });
};
module.exports = { roleMiddleware, isAdmin };
