import {HttpError, isHttpError} from '@icancode/base';
import {Request, Response, NextFunction} from 'express';
import {reply} from './reply';
import {log} from './logger';
const debug = require('debug')('icancode:express:middleware');

export const handleError = (
  e: any,
  request: Request,
  response: Response,
  next: NextFunction
): void => {
  debug('catch error', e);
  const err: HttpError = isHttpError(e)
    ? e
    : {
        status: 500,
        code: 'server.error',
        message: 'Internal Server Error',
      };
  const {code, message, status} = err;

  reply(response).status(status).json({
    code,
    message,
  });

  if (process.env.NODE_ENV !== 'test') {
    log(response).error(e.message || e);
    log(response).flush();
  }

  next();
};
