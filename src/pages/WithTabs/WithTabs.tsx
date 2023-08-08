import React, { useMemo } from 'react';
import { SceneApp, SceneAppPage } from '@grafana/scenes';
import { ROUTES } from '../../constants';
import { prefixRoute } from '../../utils/utils.routing';
import { getBasicScene } from '../Home/scenes';

const getTab1Scene = () => {
  return getBasicScene();
};

const getTab2Scene = () => {
  return getBasicScene();
};

const getScene = () =>
  new SceneApp({
    pages: [
      new SceneAppPage({
        title: 'Page with tabs',
        subTitle: 'This scene showcases a basic tabs functionality.',
        // Important: Mind the page route is ambiguous for the tabs to work properly
        url: prefixRoute(`${ROUTES.WithTabs}`),
        hideFromBreadcrumbs: true,
        getScene: getTab1Scene,
        tabs: [
          new SceneAppPage({
            title: 'Server names',
            url: prefixRoute(`${ROUTES.WithTabs}`),
            getScene: getTab1Scene,
          }),
          new SceneAppPage({
            title: 'House locations',
            url: prefixRoute(`${ROUTES.WithTabs}/tab-two`),
            getScene: getTab2Scene,
          }),
        ],
      }),
    ],
  });

export const PageWithTabs = () => {
  const scene = useMemo(() => getScene(), []);

  return <scene.Component model={scene} />;
};
