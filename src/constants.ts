import pluginJson from './plugin.json';

export const PLUGIN_BASE_URL = `/a/${pluginJson.id}`;

export enum ROUTES {
  Home = 'home',
  Instructions = 'instructions',
}

export const DATASOURCE_REF = {
  uid: 'loki',
  type: 'loki',
};
