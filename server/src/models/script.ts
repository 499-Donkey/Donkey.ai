import { InferSchemaType, model, Schema } from "mongoose";

const scriptSchema = new Schema({
  title: { 
    type: String, 
    required: true, 
  },

  text: { 
    type: String, 
  },

}, { timestamps: true });

type Script = InferSchemaType<typeof scriptSchema>;

export default model<Script>("Script", scriptSchema);