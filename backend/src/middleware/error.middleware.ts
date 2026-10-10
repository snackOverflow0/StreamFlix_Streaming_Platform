import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors.js";

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if(["AbortError","TimeoutError"].includes(error?.name)){res.status(503).json({message:"The database connection is temporarily unavailable. Try again."});return;}
  if(error?.type==="entity.parse.failed"){res.status(400).json({message:"Request body must be valid JSON"});return;}
  if(error?.type==="entity.too.large"){res.status(413).json({message:"Request body is too large"});return;}
  if (error instanceof AppError) {
    res.status(error.statusCode).json({ message: error.message });
    return;
  }

  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String((error as { code?: unknown }).code);
    const businessMessages=["Profile limit reached for this plan","Member limit reached for this plan","Subscription is not active","Profile owner is not active","Member account is not active","Owner already belongs to the subscription","Member already belongs to this subscription"];
    const detail=String((error as {message?:unknown}).message??"");
    if(["23514","23505"].includes(code)&&businessMessages.includes(detail)){res.status(409).json({message:detail});return;}
    const messages: Record<string, string> = {
      "23505": "That record already exists",
      "23503": "A related record does not exist",
      "23514": "The submitted value failed a database rule",
    };
    const message = messages[code];
    if (message) {
      res.status(400).json({ message });
      return;
    }
  }

  console.error(JSON.stringify({event:"request_error",requestId:res.locals.requestId,code:typeof error?.code==="string"?error.code:"INTERNAL",name:error instanceof Error?error.name:"Error"}));
  res.status(500).json({ message: "Internal server error",requestId:res.locals.requestId });
};
