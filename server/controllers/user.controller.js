const userModal = require("../models/user.model");
const { hashPassword, comparePassword } = require("../helpers/authHelper");
const JWT = require("jsonwebtoken");
var { expressjwt: jwt } = require("express-jwt");
// middleware
const requireSignIn = jwt({
  secret: process.env.JWT_SECRET,
  algorithms: ["HS256"],
  requestProperty: "auth",
});

// Middleware to set req.user based on req.auth populated by requireSignIn
const setUser = (req, res, next) => {
  if (req.auth) {
    req.user = req.auth; // Copy auth object to req.user for easier access
  }
  next(); // Now `next` will properly function
};
const registerController = async (req, res) => {
  try {
    const { name, email, phone, password, role, license } = req.body;

    if (!name) {
      return res
        .status(400)
        .send({ success: false, message: "name is required" });
    }
    if (!email) {
      return res
        .status(400)
        .send({ success: false, message: "email is required" });
    }
    if (!phone) {
      return res
        .status(400)
        .send({ success: false, message: "phone number is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "password is required with 6 characters",
      });
    }

    // existing
    const existingUser = await userModal.findOne({ email });
    if (existingUser) {
      return res
        .status(500)
        .send({ success: false, message: "email already exists" });
    }

    // hash user password
    const hashedPassword = await hashPassword(password);

    // create new user
    const newUser = new userModal({
      name,
      email,
      phone,
      password: hashedPassword,
      role: role || "passenger", // Default to "user" if not specified
      license,
    });

    await newUser.save();

    return res.status(201).send({
      success: true,
      message: "User registered successfull please login",
    });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .send({ success: false, message: "Error in register API", error });
  }
};
const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    // validation
    if (!email || !password) {
      return res.status(400).send({
        success: false,
        message: "Please provide email and password",
      });
    }

    //   find user
    const user = await userModal.findOne({ email });

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User Not Found",
      });
    }
    const hashed = user?.password;

    //   compare password
    const isMatch = await comparePassword(password, hashed);

    if (!isMatch) {
      return res.status(401).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    user.password = undefined;

    // Generate JWT token with role
    const token = JWT.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).send({
      success: true,
      message: "Login successfull",
      token,
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in login API",
      error: error,
    });
  }
};

const updateUserController = async (req, res) => {
  try {
    const { name, password, phone, license } = req.body;
    //   find user
    // Use req.user for safety
    const user = await userModal.findById(req.user._id);

    if (!user) {
      return res.status(401).send({
        success: false,
        message: "User Not Found",
      });
    }
    // password validation
    if (password && password.length < 6) {
      return res.status(400).send({
        success: false,
        message: "password is required with 6 characters",
      });
    }

    const hashed = password ? await hashPassword(password) : user.password;

    user.name = name || user.name;
    user.phone = phone || user.phone;
    user.password = hashed;
    if (user.role === "rider") user.license = license || user.license;

    await user.save(); // Save updated user
    user.password = undefined;

    return res.status(200).send({
      success: true,
      message: "Profile Updated Please Login",
      updatedUser: user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      success: false,
      message: "Error in User Update API",
      error: error,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  updateUserController,
  requireSignIn,
  setUser,
};
