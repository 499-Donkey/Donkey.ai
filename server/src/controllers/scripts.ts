import { RequestHandler } from "express";
import ScriptModel from "../models/script";
import createHttpError from "http-errors";
import mongoose from "mongoose";

export const getScripts: RequestHandler = async (req, res, next) => {
  try {
    const scripts = await ScriptModel.find().exec();
    res.status(200).json(scripts);
  } catch (error) {
    next(error);
  }
};

export const getScript: RequestHandler = async (req, res, next) => {
  const scriptId = req.params.scriptId;

  try {
    if (!mongoose.isValidObjectId(scriptId)) {
      throw createHttpError(400, "Invalid script id");
    }

    const script = await ScriptModel.findById(scriptId).exec();

    if (!script) {
      throw createHttpError(404, "Script not found");
    }

    res.status(200).json(script);
  } catch (error) {
    next(error);
  }
};

interface CreateScriptBody {
  title?: string,
  text?: string,
}

export const createScript: RequestHandler<
  unknown,
  unknown,
  CreateScriptBody,
  unknown
> = async (req, res, next) => {
  const title = req.body.title;
  const text = req.body.text;

  try {
    if (!title) {
      throw createHttpError(400, "Script must have a title");
    }

    const newScript = await ScriptModel.create({
      title: title,
      text: text,
    });

    res.status(201).json(newScript);
  } catch (error) {
    next(error);
  }
};


interface UpdateScriptParams {
  scriptId: string,
}

interface UpdateScriptBody {
  title?: string,
  text?: string,
}

export const updateScript: RequestHandler<UpdateScriptParams, unknown, UpdateScriptBody, unknown> =  async(req, res, next) => {
  const scriptId = req.params.scriptId;
  const newTitle = req.body.title;
  const newText = req.body.text;


  try{
    if (!mongoose.isValidObjectId(scriptId)) {
      throw createHttpError(400, "Invalid script id");
    }

    if (!newTitle) {
      throw createHttpError(400, "Script must have a title");
    }

    const script = await ScriptModel.findById(scriptId).exec();

    if (!script) {
      throw createHttpError(404, "Script not found");
    }

    // ! used to assert that these properties are not undefined.
    script.title = newTitle!;
    script.text = newText!;

    const updatedScript = await script.save();

    res.status(200).json(updatedScript);
  } catch (error){
    next(error);
  }
}

export const deleteScript: RequestHandler = async(req, res, next) => {
  const scriptId = req.params.scriptId;

  try {
    if (!mongoose.isValidObjectId(scriptId)) {
      throw createHttpError(400, "Invalid script id");
    }

    const script = await  ScriptModel.findById(scriptId).exec();

    if (!script) {
      throw createHttpError(404, "Script not found");
    }

    await ScriptModel.findByIdAndDelete(scriptId);

    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
}