import { config } from 'dotenv';
// Load config from .env file
config();

// Possible/allowed configuration keys
export type ConfigKey =
  | 'PORT'
  | 'IMAP_PORT_SSL'
  | 'POP3_PORT_SSL'
  | 'IMAP_PORT_NOSSL'
  | 'POP3_PORT_NOSSL'
  | 'IMAP_HOST'
  | 'POP3_HOST';

/**
 * This class is responsible for retrieval of configuration values
 */
export class Configuration {
  /**
   * Get a configuration value with a given key
   *
   * Returns configuration value if found, if not found return fallback value if provided, else throw error
   *
   * @param {ConfigKey} key - Configuration variable key
   * @param {any} fallback - (optional) Fallback value in case configuration value is not found
   */
  public static getValue(key: ConfigKey, fallback?: any): any {
    const value = process.env[key];

    if (value) {
      return value;
    } else if (fallback) {
      return fallback;
    } else {
      throw new Error(`Configuration Error: Value not found for key ${key}`);
    }
  }
}
