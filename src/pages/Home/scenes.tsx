import { config } from '@grafana/runtime';
import {
  EmbeddedScene,
  PanelBuilders,
  SceneControlsSpacer,
  SceneFlexItem,
  SceneFlexLayout,
  SceneQueryRunner,
  SceneRefreshPicker,
  SceneTimePicker,
  SceneTimeRange,
  VariableValueSelectors,
} from '@grafana/scenes';

function getDs() {
  const entry = Object.entries(config.datasources).find(([_, ds]) => ds.type === 'loki');
  const ds = entry ? entry[1] : null;
  return ds ? { type: ds.type, uid: ds.uid } : undefined;
}

export function getBasicScene() {
  const timeRange = new SceneTimeRange({
    from: 'now-6h',
    to: 'now',
  });  

  return new EmbeddedScene({
    $timeRange: timeRange,
    body: new SceneFlexLayout({
      children: [
        getTotalRequestsScene(),
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
    .setTitle('Visits')
    .setData(queryRunner)
    .build();
  
  return new SceneFlexItem({
    minHeight: 300,
    body: panel,
  });
}
