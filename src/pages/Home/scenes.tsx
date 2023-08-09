import { config } from '@grafana/runtime';
import {
  DataSourceVariable,
  EmbeddedScene,
  PanelBuilders,
  QueryVariable,
  SceneControlsSpacer,
  SceneGridItem,
  SceneGridLayout,
  SceneQueryRunner,
  SceneRefreshPicker,
  SceneTimePicker,
  SceneTimeRange,
  SceneVariableSet,
  VariableValueSelectors,
} from '@grafana/scenes';

function getDs() {
  console.log(config.datasources);
  const entry = Object.entries(config.datasources).find(([_, ds]) => ds.type === 'loki');
  const ds = entry ? entry[1] : null;
  return ds ? { type: ds.type, uid: ds.uid } : undefined;
}

export function getBasicScene() {
  const timeRange = new SceneTimeRange({
    from: 'now-6h',
    to: 'now',
  });

  const dsHandler = new DataSourceVariable({
    label: 'Data source',
    name: 'ds',
    pluginId: 'loki'
  });
  const streamHandler = new QueryVariable({
    label: 'Log stream',
    name: 'stream',
    datasource: {
      type: 'loki',
      uid: '$ds'
    },
    query: 'label_names()',
  });

  return new EmbeddedScene({
    $timeRange: timeRange,
    $variables: new SceneVariableSet({
      variables: [dsHandler, streamHandler],
    }),
    body: new SceneGridLayout({
      children: [
        getTotalRequestsScene(),
        getRealtimeVisitorsScene(),
        getErrorRequestsScene(),
        getBytesSentScene(),
        getLogsScene()
      ],
    }),
    controls: [
      new VariableValueSelectors({}),
      new SceneControlsSpacer(),
      new SceneTimePicker({ isOnCanvas: true }),
      new SceneRefreshPicker({
        intervals: ['5s', '1m', '1h'],
        isOnCanvas: true,
      }),
    ],
  });
}

function getTotalRequestsScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'sum(count_over_time({source="/var/log/access.log"}[$__interval]))',
      },
    ],
  });

  const panel = PanelBuilders.timeseries()
    .setTitle('Total requests')
    .setData(queryRunner)
    .build();
  
  return new SceneGridItem({
    x: 0,
    y: 0,
    height: 8,
    width: 12,
    body: panel,
  });
}

function getRealtimeVisitorsScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'count(sum by (remote_addr) (count_over_time({source="/var/log/access.log"} [$__interval])))',
      },
    ],
    $timeRange: new SceneTimeRange({ from: 'now-5m', to: 'now' }),
  });

  const panel = PanelBuilders.stat()
    .setTitle('Real time visitors')
    .setData(queryRunner)
    .build();
  
  return new SceneGridItem({
    height: 8,
    width: 8,
    x: 0,
    y: 8,
    body: panel,
  });
}

function getErrorRequestsScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'sum by (status) (count_over_time({source="/var/log/access.log", status!="200"} [$__interval]))',
      },
    ],
  });

  const panel = PanelBuilders.timeseries()
    .setTitle('Requests with errors')
    .setData(queryRunner)
    .build();
  
  return new SceneGridItem({
    height: 8,
    width: 12,
    x: 12,
    y: 0,
    body: panel,
  });
}

function getBytesSentScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'sum by(source) (sum_over_time({source="/var/log/access.log"} | unwrap bytes_sent [$__interval]))',
      },
    ],
  });

  const panel = PanelBuilders.timeseries()
    .setTitle('Bytes sent')
    .setData(queryRunner)
    .build();
  
  return new SceneGridItem({
    height: 8,
    width: 16,
    x: 8,
    y: 8,
    body: panel,
  });
}

function getLogsScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: '{source="/var/log/access.log"}',
        limit: 5000,
      },
    ],
  });

  const panel = PanelBuilders.logs()
    .setTitle('Logs')
    .setData(queryRunner)
    .build();
  
  return new SceneGridItem({
    height: 16,
    width: 24,
    x: 0,
    y: 16,
    body: panel,
  });
}
