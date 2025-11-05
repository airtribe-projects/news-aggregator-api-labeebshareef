import { Request, Response } from "express";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";

export const signup = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) return res.status(400).json({ message: "Email and password required" });

  const existingUser = await User.findOne({ email });
  if (existingUser) return res.status(400).json({ message: "User already exists" });

  const user = await User.create({ email, password });
  const token = generateToken((user._id as any).toString());

  res.status(201).json({
    success: true,
    token,
    user: { id: user._id, email: user.email },
  });
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  const isMatch = await user.comparePassword(password);
  if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

  const token = generateToken((user._id as any).toString());
  res.json({
    success: true,
    token,
    user: { id: user._id, email: user.email },
  });
};

export const getProfile = async (req: any, res: Response) => {
  res.json(req.user);
};
