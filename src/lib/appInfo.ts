import pkg from '../../package.json';

// Type for exported app information
export interface AppInfo {
  version: string;
  name: string;
}

// Export app information from package.json
export const appInfo: AppInfo = {
  version: pkg.version,
  name: pkg.name,
};
