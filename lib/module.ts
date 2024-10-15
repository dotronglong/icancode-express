import {Express} from 'express';

/**
 * Module
 */
export interface Module {
  name(): string;
  install(app: Express): Promise<void>;
}

/**
 * ModuleLoader
 */
export class ModuleLoader {
  private app: Express;
  private registeredModules: Record<string, Module>;

  /**
   * Constructor
   * @param {Express} app
   * @param {...Module[]} modules
   */
  constructor(app: Express, ...modules: Module[]) {
    this.app = app;
    this.register(...modules);
  }

  /**
   * Register module
   * @param {...Module[]} modules
   * @return {ModuleLoader}
   */
  register(...modules: Module[]): ModuleLoader {
    modules.forEach((m) => this.registeredModules[m.name()] = m);

    return this;
  }

  /**
   * Load modules by names
   * @param {...string[]} names The names of modules to be loaded
   * @return {Promise<void>}
   */
  async load(...names: string[]): Promise<void> {
    if (process.env.MODULES !== undefined) {
      names = process.env.MODULES.split(',');
    } else {
      names = Object.keys(this.registeredModules);
    }

    const tasks = names
        .map((name) => this.registeredModules[name]?.install(this.app))
        .filter((task): task is Promise<void> => task !== undefined);

    await Promise.all(tasks);
  }
}
