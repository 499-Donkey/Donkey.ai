import { RequestHandler } from "express";
import UserModel from "../models/user";

export const getUsers: RequestHandler = async (req, res, next) => {
  try {
    const users = await UserModel.find().exec();
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
};

export const getUser: RequestHandler = async (req, res, next) => {
  const userId = req.params.userId;

  try {
    const user = await UserModel.findById(userId).exec();
    res.status(200).json(user)
  } catch (error) {
    next(error);
  }
};

export const createUser: RequestHandler = async (req, res, next) => {
  const username = req.body.username;
  const password = req.body.password;
  const email = req.body.email;
  const vip = req.body.vip;

  try {
    const newUser = await UserModel.create({
      username: username,
      password: password,
      email: email,
      vip: vip,
    });

    res.status(201).json(newUser);
  } catch (error){
    next(error)
  }
}