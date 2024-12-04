import jwt from "jsonwebtoken";

//admin authentication

const authAdmin = async (req, res, next) => {
  try {
    const { atoken } = req.headers;

    if (!atoken) {
      return res.status(401).json({ success: false, message: "Not Authorized, login again" });
    }

    const tokenDecode = jwt.verify(atoken, process.env.JWT_SECRET);

    if (
      tokenDecode.email !== process.env.ADMIN_EMAIL ||
      tokenDecode.password !== process.env.ADMIN_PASSWORD
    ) {
      return res.status(403).json({ success: false, message: "Not Authorized" });
    }

    next(); 
  } catch (error) {
    console.error("Authentication Error:", error.message);
    return res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};


export default authAdmin;