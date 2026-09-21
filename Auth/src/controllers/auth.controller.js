import UserModel from "../models/user.model.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import config from "../config/config.js";
import { publishToQueue } from "../broker/rabbit.js";

export async function register(req, res) {
  const {
    email,
    password,
    fullname: { firstName, lastName },
    role = "user",
  } = req.body;

  const isUserAlreadyExist = await UserModel.findOne({ email });

  if (isUserAlreadyExist) {
    return res.status(400).json({ message: "User already exists" });
  }

  const hash = await bcrypt.hash(password, 10);

  const newUser = await UserModel.create({
    email,
    password: hash,
    fullname: { firstName, lastName },
    role,
  });

  const token = jwt.sign(
    { id: newUser._id, role: newUser.role, fullname: newUser.fullname },
    config.JWT_SECRET,
    { expiresIn: "2d" },
  );

  await publishToQueue("user_registered", {
    id: newUser._id,
    email: newUser.email,
    fullname: newUser.fullname,
    role: newUser.role,
  });

  res.cookie("token", token);

  res.status(201).json({
    message: "User registered successfully",
    user: {
      id: newUser._id,
      email: newUser.email,
      fullname: newUser.fullname,
      role: newUser.role,
    },
  });
}

export async function googleAuthCallback(req, res) {
  const user = req.user;
  const role = req.query.state === "artist" ? "artist" : "user";

  const isUserAlreadyExist = await UserModel.findOne({
    $or: [{ email: user.emails[0].value }, { googleId: user.id }],
  });

  if (isUserAlreadyExist) {
    const token = jwt.sign(
      {
        id: isUserAlreadyExist._id,
        role: isUserAlreadyExist.role,
        fullname: isUserAlreadyExist.fullname,
      },
      config.JWT_SECRET,
      { expiresIn: "2d" },
    );

    res.cookie("token", token);

    if (isUserAlreadyExist.role === "artist") {
      res.redirect("http://localhost:5173/artist/dashboard");
    }

    res.redirect("http://localhost:5173/"); 
  }

  const newUser = await UserModel.create({
    email: user.emails[0].value,
    googleId: user.id,
    fullname: {
      firstName: user.name.givenName,
      lastName: user.name.familyName,
    },
    role,
    c,
  });

  const token = jwt.sign(
    { id: newUser._id, role: newUser.role, fullname: newUser.fullname },
    config.JWT_SECRET,
    { expiresIn: "2d" },
  );

  await publishToQueue("user_registered", {
    id: newUser._id,
    email: newUser.email,
    fullname: newUser.fullname,
    role: newUser.role,
  });

  res.cookie("token", token);

  res.redirect("http://localhost:5173/");
}

export async function login(req, res) {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "User not found" });
  }

  const passwordMatch = bcrypt.compare(password, user.password);
  if (!passwordMatch) {
    return res.status(400).json({ message: "Invalid password" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role, fullname: user.fullname },
    config.JWT_SECRET,
    { expiresIn: "2d" },
  );

  res.cookie("token", token);

  res.status(200).json({
    message: "User logged in successfully",
    user: {
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      role: user.role,
    },
  });
}
