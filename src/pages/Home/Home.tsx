import React, { useMemo } from 'react';

import { SceneApp, SceneAppPage } from '@grafana/scenes';
import { getBasicScene } from './scenes';
import { prefixRoute } from '../../utils/utils.routing';
import { ROUTES } from '../../constants';
import { config } from '@grafana/runtime';
import { Alert } from '@grafana/ui';
import { DataSourceInstanceSettings } from '@grafana/data';

const getScene = () => {
  return new SceneApp({
    pages: [
      new SceneAppPage({
        title: 'Grafana Access Logs',
        url: prefixRoute(ROUTES.Home),
        getScene: () => {
          return getBasicScene();
        },
      }),
    ],
  });
};

function hasLoggingDataSources(dataSources: Record<string, DataSourceInstanceSettings>) {
  return Object.entries(dataSources).some(([_, ds]) => ds.type === 'loki' || ds.type === 'elasticsearch');
}

export const HomePage = () => {
  const scene = useMemo(() => getScene(), []);

  const hasDataSources = useMemo(() => hasLoggingDataSources(config.datasources), []);

  return (
    <>
       {!hasDataSources && (
        <Alert title={`Missing logging data sources`}>
          Grafana Access Logs requires a logging datasource. Please add a logging datasource to your Grafana instance.
        </Alert>
      )}

      <scene.Component model={scene} />
    </>
  );
};
