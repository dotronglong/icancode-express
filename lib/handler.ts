import {Request, Response, NextFunction} from 'express';

type Handler = (
  request: Request,
  response: Response,
  next: NextFunction
) => void;
type AsyncHandler = (request: Request, response: Response) => Promise<void>;

/**
 * Handle async handler
 * @param {AsyncHandler} handler
 * @return {Handler}
 */
export function handle(handler: AsyncHandler): Handler {
  return (request: Request, response: Response, next: NextFunction) => {
    handler(request, response).then(next).catch(next);
  };
}
