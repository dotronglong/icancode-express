import {StringHashMap, HashMap} from '@icancode/base';
import {v4 as uuidv4} from 'uuid';
import {Request, Response} from 'express';
import {Logger} from '@icancode/logger';

/**
 * ExpressLogger
 */
export default class ExpressLogger implements Logger {
  private request: Request;
  private response: Response;
  private metadata: StringHashMap;
  private traces: HashMap[];
  private timestamp: number;
  private duration: number;
  private isFlushed: boolean;

  /**
   * Constructor
   * @param {Request} request
   * @param {Response} response
   * @param {string=} name
   * @param {StringHashMap=} metadata
   */
  constructor(
      request: Request,
      response: Response,
      name?: string,
      metadata: StringHashMap = {},
  ) {
    this.request = request;
    this.response = response;
    this.metadata = Object.assign({}, metadata, {
      Name: name || 'Logger',
      TraceID: uuidv4(),
    });
    this.traces = [];
    this.timestamp = Date.now();
    this.duration = 0;
    this.isFlushed = false;
  }

  /**
   * Log a message with specified level
   * @param {'DEBUG' | 'INFO' | 'WARN' | 'ERROR'} level
   * @param {*} message
   */
  private log(level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR', message: any): void {
    const duration = Date.now() - this.timestamp;
    this.traces.push({
      Level: level,
      Message: message,
      Duration: duration,
    });
    this.timestamp = Date.now();
    this.duration += duration;
  }

  /**
   * Logs debug message
   * @param {*} message
   */
  debug(message: any): void {
    this.log('DEBUG', message);
  }

  /**
   * Logs info message
   * @param {*} message
   */
  info(message: any): void {
    this.log('INFO', message);
  }

  /**
   * Logs info message
   * @param {*} message
   */
  warn(message: any): void {
    this.log('WARN', message);
  }

  /**
   * Logs info message
   * @param {*} message
   */
  error(message: any): void {
    this.log('ERROR', message);
  }

  /**
   * Set meta
   * @param {StringHashMap} metadata
   * @param {boolean=} merge
   * @return {Logger}
   */
  with(metadata: StringHashMap, merge?: boolean): Logger {
    if (merge === undefined || merge) {
      this.metadata = Object.assign({}, this.metadata, metadata);
    } else {
      this.metadata = metadata;
    }

    return this;
  }

  /**
   * Get a value of metadata
   * @param {string} key
   * @return {string}
   */
  get(key: string): string {
    return this.metadata[key] || '';
  }

  /**
   * Set a metadata key=value
   * @param {string} key
   * @param {string} value
   * @return {Logger}
   */
  set(key: string, value: string): Logger {
    this.metadata[key] = value;
    return this;
  }

  /**
   * Flush the logs
   */
  flush(): void {
    if (this.isFlushed) {
      return;
    }

    const duration = Date.now() - this.timestamp;
    const data: HashMap = Object.assign({}, this.metadata, {
      Request: this.getRequestInformation(),
      Response: this.getResponseInformation(),
      Duration: this.duration + duration,
      Traces: this.traces,
    });

    console.log(JSON.stringify(data));
    this.isFlushed = true;
  }

  /**
   * Returns request's information
   * @return {HashMap}
   */
  private getRequestInformation(): HashMap {
    return {
      Method: this.request.method,
      Url: this.request.originalUrl,
      Headers: this.request.headers,
      Body: this.request.body || {},
    };
  }

  /**
   * Returns response's information
   * @return {HashMap}
   */
  private getResponseInformation(): HashMap {
    return {
      StatusCode: this.response.statusCode,
      Headers: this.response.getHeaders(),
      Body: this.response.locals.body || {},
    };
  }
}
