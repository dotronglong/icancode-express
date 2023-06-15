import {StringHashMap} from '@icancode/base';
import {Response} from 'express';
import {getLogger} from './logger';

/**
 * ExpressResponse
 */
export class ExpressResponse {
  private _status: number;
  private _headers: StringHashMap;
  private _body: any;
  private _response: Response;

  /**
   * Constructor
   * @param {Response} response
   */
  constructor(response: Response) {
    this._status = 200;
    this._headers = {};
    this._body = '';
    this._response = response;
  }

  /**
   * Set response's body
   * @param {*} body
   * @return {ExpressResponse}
   */
  body(body: any): ExpressResponse {
    this._body = body;
    return this;
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
   * @param {boolean} reportError
   */
  send(reportError: boolean = false) {
    if (this._response.locals.isSent) {
      // will not send if response was already sent
      return;
    }

    try {
      const s = this._status;
      const h = Object.assign({}, this._headers || {}, {
        'Trace-ID': getLogger(this._response).get('TraceID'),
      });
      const b = this._body || {};
      this._response.locals.body = b;
      this._response.status(s).set(h).json(b);
      this._response.locals.isSent = true;
    } catch (e) {
      if (reportError) {
        throw e;
      }
    }
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
