import {HttpError} from '@icancode/base';
import {Request, Response, NextFunction} from 'express';
import {reply} from './reply';
import {log} from './logger';

// eslint-disable-next-line max-len
export const handleError = (e: any, request: Request, response: Response, next: NextFunction): void => {
  let err: HttpError = new HttpError(500, 'server.error', 'Internal Server Error'); // eslint-disable-line
  if (e !== undefined) {
    if (e instanceof HttpError) {
      err = e;
    } else if (e.status !== undefined) {
      err = new HttpError(e.status);
    }

    const {code, message, status} = err;
    reply(response).status(status).json({
      code,
      message,
    });

    if (process.env.NODE_ENV !== 'test') {
      log(response).error(e);
      log(response).flush();
    }
  }

  next();
};
