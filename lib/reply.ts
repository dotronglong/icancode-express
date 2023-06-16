import {StringHashMap} from '@icancode/base';
import {Response} from 'express';
import {log} from './logger';

/**
 * ExpressResponse
 */
export class ExpressResponse {
  private _status: number;
  private _headers: StringHashMap;
  private _response: Response;

  /**
   * Constructor
   * @param {Response} response
   */
  constructor(response: Response) {
    this._status = 200;
    this._headers = {};
    this._response = response;
  }

  /**
   * Set response's status code
   * @param {number} status
   * @return {ExpressResponse}
   */
  status(status: number): ExpressResponse {
    this._status = status;
    return this;
  }

  /**
   * Set response's headers
   * @param {StringHashMap} headers
   * @return {ExpressResponse}
   */
  headers(headers: StringHashMap): ExpressResponse {
    this._headers = headers;
    return this;
  }

  /**
   * Set value to a specific header's key
   * @param {string} key
   * @param {string} value
   * @return {ExpressResponse}
   */
  set(key: string, value: string): ExpressResponse {
    this._headers[key] = value;
    return this;
  }

  /**
   * Remove a header's key
   * @param {string} key
   * @return {ExpressResponse}
   */
  unset(key: string): ExpressResponse {
    delete this._headers[key];
    return this;
  }

  /**
   * Send response out
   * @param {*} body
   * @param {'json' | undefined} type
   */
  send(body: any, type: 'json' | undefined = undefined) {
    if (this.isSent()) {
      // ignore it
      return;
    }

    const s = this._status;
    const h = Object.assign({}, this._headers || {}, {
      'Trace-ID': log(this._response).get('TraceID'),
    });
    this._response.locals.body = body;
    this._response.locals.isSent = true;
    this._response.status(s).set(h);
    if (type === 'json') {
      this._response.json(body);
    } else {
      this._response.send(body);
    }
  }

  /**
   * Send response with JSON
   * @param {*} body
   */
  json(body: any) {
    this.send(body, 'json');
  }

  /**
   * Determine if response is already sent
   * @return {boolean}
   */
  isSent(): boolean {
    return this._response.locals.isSent || false;
  }
}

/**
 * Initiates an ExpressResponse instance
 * @param {Response} response
 * @return {ExpressResponse}
 */
export function reply(response: Response): ExpressResponse {
  return new ExpressResponse(response);
}
