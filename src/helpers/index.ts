 
import crypto from "crypto";

import dotenv from "dotenv";

dotenv.config();

export const random = () => crypto.randomBytes(128).toString("base64");
export const authentication = (password: string, salt: string) => {
  const hash = crypto
    .createHmac("sha256", [salt, password].join("/"))
    .update(process.env.SECRET_KEY!)
    .digest("hex");

  return hash;
};
