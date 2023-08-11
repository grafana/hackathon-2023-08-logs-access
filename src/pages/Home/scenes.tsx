import {
  CustomVariable,
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
  TextBoxVariable,
  VariableValueSelectors,
} from '@grafana/scenes';
import { BigValueColorMode, BigValueGraphMode, BigValueJustifyMode, BigValueTextMode } from '@grafana/schema';

function getDs() {
  return { type: 'loki', uid: '$ds' };
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
    label: 'Source stream',
    name: 'stream_name',
    datasource: {
      type: 'loki',
      uid: '$ds'
    },
    query: 'label_names()',
  });
  const streamValueHandler = new QueryVariable({
    label: 'Stream value',
    name: 'stream_value',
    datasource: {
      type: 'loki',
      uid: '$ds'
    },
    query: 'label_values(source)',
  });
  const logFormatHandler = new CustomVariable({
    label: 'Log format',
    name: 'parser',
    query: 'JSON : json,Logfmt : logfmt,Regex : regex'
  });
  const regexHandler = new TextBoxVariable({
    label: 'Regex',
    name: 'regex',
  });

  return new EmbeddedScene({
    $timeRange: timeRange,
    $variables: new SceneVariableSet({
      variables: [dsHandler, streamHandler, streamValueHandler, logFormatHandler, regexHandler],
    }),
    body: new SceneGridLayout({
      children: [
        // Top panels
        getTotalRequestsScene(),
        getSuccessfulRequestsScene(),
        getErrorRequestsScene(),
        getRedirectionsScene(),
        getStaticFileRequests(),
        getStaticFileTransferRequests(),
        // Bottom panels
        getRealtimeVisitorsScene(),
        getRequestsRateScene(),
        // Graphs
        getRequestsOverTimeScene(),
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
        expr: 'sum(count_over_time({$stream_name="$stream_value"} [$__interval]))',
      },
    ],
  });

  const panel = PanelBuilders.stat()
    .setTitle('Total requests')
    .setData(queryRunner)
    .setOption('textMode', BigValueTextMode.Value)
    .setOption('colorMode', BigValueColorMode.Background)
    .setOption('graphMode', BigValueGraphMode.Area)
    .setOption('justifyMode', BigValueJustifyMode.Center)
    .setOption('reduceOptions', {
      values: false,
      calcs: ['sum'],
      fields: '',
    });
  
  return new SceneGridItem({
    x: 0,
    y: 0,
    height: 4,
    width: 4,
    body: panel.build(),
  });
}

function getSuccessfulRequestsScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'sum(count_over_time({$stream_name="$stream_value"} | status > 199 | status < 300 [$__interval]))',
      },
    ],
  });

  const panel = PanelBuilders.stat()
    .setTitle('Successful requests (2xx)')
    .setData(queryRunner)
    .setOption('textMode', BigValueTextMode.Value)
    .setOption('colorMode', BigValueColorMode.Background)
    .setOption('graphMode', BigValueGraphMode.Area)
    .setOption('justifyMode', BigValueJustifyMode.Center)
    .setOption('reduceOptions', {
      values: false,
      calcs: ['sum'],
      fields: '',
    });
  
  return new SceneGridItem({
    x: 4,
    y: 0,
    height: 4,
    width: 4,
    body: panel.build(),
  });
}

function getErrorRequestsScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'sum(count_over_time({$stream_name="$stream_value"} | status > 399 [$__interval]))',
      },
    ],
  });

  const panel = PanelBuilders.stat()
    .setTitle('Failed requests (4xx/5xx)')
    .setData(queryRunner)
    .setOption('textMode', BigValueTextMode.Value)
    .setOption('colorMode', BigValueColorMode.Background)
    .setOption('graphMode', BigValueGraphMode.Area)
    .setOption('justifyMode', BigValueJustifyMode.Center)
    .setOption('reduceOptions', {
      values: false,
      calcs: ['sum'],
      fields: '',
    })
  
  return new SceneGridItem({
    x: 8,
    y: 0,
    height: 4,
    width: 4,
    body: panel.build(),
  });
}

function getRedirectionsScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'sum(count_over_time({$stream_name="$stream_value"} | status > 299 | status < 400 [$__interval]))',
      },
    ],
  });

  const panel = PanelBuilders.stat()
    .setTitle('Redirects (3xx)')
    .setData(queryRunner)
    .setOption('textMode', BigValueTextMode.Value)
    .setOption('colorMode', BigValueColorMode.Background)
    .setOption('graphMode', BigValueGraphMode.Area)
    .setOption('justifyMode', BigValueJustifyMode.Center)
    .setOption('reduceOptions', {
      values: false,
      calcs: ['sum'],
      fields: '',
    });
  
  return new SceneGridItem({
    x: 12,
    y: 0,
    height: 4,
    width: 4,
    body: panel.build(),
  });
}

function getStaticFileRequests() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'sum(count_over_time({$stream_name="$stream_value"} | $parser $regex | request_uri=~".*\.(jpg|png|css|js|gif|webm|mp4|webp)" [$__interval]))',
      },
    ],
  });

  const panel = PanelBuilders.stat()
    .setTitle('Static file requests')
    .setData(queryRunner)
    .setOption('textMode', BigValueTextMode.Value)
    .setOption('colorMode', BigValueColorMode.Background)
    .setOption('graphMode', BigValueGraphMode.Area)
    .setOption('justifyMode', BigValueJustifyMode.Center)
    .setOption('reduceOptions', {
      values: false,
      calcs: ['sum'],
      fields: '',
    });
  
  return new SceneGridItem({
    x: 16,
    y: 0,
    height: 4,
    width: 4,
    body: panel.build(),
  });
}

function getStaticFileTransferRequests() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'sum(sum_over_time({$stream_name="$stream_value"} | $parser $regex | request_uri=~".*\.(jpg|png|css|js|gif|webm|mp4|webp)" | unwrap bytes(bytes_sent) [1m]))',
      },
    ],
  });

  const panel = PanelBuilders.stat()
    .setTitle('Static file transferred (MB)')
    .setData(queryRunner)
    .setOption('textMode', BigValueTextMode.Value)
    .setOption('colorMode', BigValueColorMode.Background)
    .setOption('graphMode', BigValueGraphMode.Area)
    .setOption('justifyMode', BigValueJustifyMode.Center)
    .setUnit('bytes')
    .setOption('reduceOptions', {
      values: false,
      calcs: ['sum'],
      fields: '',
    });
  
  return new SceneGridItem({
    x: 20,
    y: 0,
    height: 4,
    width: 4,
    body: panel.build(),
  });
}

function getRealtimeVisitorsScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'count(sum by (remote_addr) (count_over_time({$stream_name="$stream_value"} | $parser |  __error__="" [$__interval])))',
      },
    ],
    $timeRange: new SceneTimeRange({ from: 'now-5m', to: 'now' }),
  });

  const panel = PanelBuilders.stat()
    .setTitle('Real time visitors')
    .setData(queryRunner)
    .setOption('reduceOptions', {
      values: false,
      calcs: ['mean'],
      fields: '',
    });
  
  return new SceneGridItem({
    height: 4,
    width: 4,
    x: 0,
    y: 8,
    body: panel.build(),
  });
}

function getRequestsRateScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'sum(rate({$stream_name="$stream_value"} [$__interval]))',
      },
    ],
  });

  const panel = PanelBuilders.stat()
    .setTitle('Request rate')
    .setData(queryRunner);
  
  return new SceneGridItem({
    height: 4,
    width: 4,
    x: 4,
    y: 8,
    body: panel.build(),
  });
}

function getRequestsOverTimeScene() {
  const queryRunner = new SceneQueryRunner({
    datasource: getDs(),
    queries: [
      {
        refId: 'A',
        datasource: getDs(),
        expr: 'sum by (status) (count_over_time({$stream_name="$stream_value"} [$__interval]))',
      },
    ],
  });

  const panel = PanelBuilders.timeseries()
    .setTitle('Requests with errors')
    .setData(queryRunner)
    .build();
  
  return new SceneGridItem({
    height: 8,
    width: 16,
    x: 8,
    y: 4,
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
        expr: '{$stream_name="$stream_value"}',
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
