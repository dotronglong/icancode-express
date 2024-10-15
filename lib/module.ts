import {Express} from 'express';

/**
 * Module
 */
export interface Module {
  name(): string;
  install(app: Express): Promise<void>;
}

/**
 * Loader
 */
export class Loader {
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
   * @return {Loader}
   */
  register(...modules: Module[]): Loader {
    modules.forEach((m) => this.registeredModules[m.name()] = m);

    return this;
  }

  /**
   * Load modules
   * @param {string[]} depends Ensure these modules are loaded first
   * @return {Promise<void>}
   */
  async load(depends: string[] = []): Promise<void> {
    let names: string[];
    if (process.env.MODULES !== undefined) {
      names = process.env.MODULES.split(',');
    } else {
      names = Object.keys(this.registeredModules);
    }

    if (depends.length > 0) {
      await this.__loadModulesByNames(depends);
    }

    await this.__loadModulesByNames(
        names.filter((name) => depends.indexOf(name) < 0),
    );
  }

  /**
   * Load specified modules by names
   * @param {string[]} names
   * @return {Promise<void>}
   */
  private async __loadModulesByNames(
      names: string[],
  ): Promise<void[]> {
    const tasks = names.map((name) => {
      const module = this.registeredModules[name];
      if (module !== undefined) {
        return module.install(this.app);
      }

      return Promise.resolve();
    });

    return Promise.all(tasks);
  }
}
