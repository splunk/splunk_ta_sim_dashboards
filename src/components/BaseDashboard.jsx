import React, { useCallback, useState, useMemo, useEffect } from 'react';
import Dashboard, { themes as dashboardThemes } from '@splunk/dashboard';
import { DashboardContextProvider } from '@splunk/dashboard-context';
import { ThemeProvider } from 'styled-components';
import IconRegistry from '@splunk/dashboard-context/IconRegistry';
import LocalIconProvider from '@splunk/dashboard-context/LocalIconProvider';
import StandardIconProvider from '@splunk/dashboard-context/StandardIconProvider';
import EnterprisePreset, { themes as presetThemes } from '@splunk/dashboard-presets/EnterprisePreset';
import CustomPreset from './CustomPreset'
import SourceEditor, { themes as sourceEditorThemes } from '@splunk/dashboard/DashboardSourceEditor';
import { themes as reactUIThemes } from '@splunk/react-ui/themes';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import { TelemetryContextProvider } from '@splunk/dashboard-telemetry/TelemetryContext';
import { SWACollector } from '@splunk/dashboard-telemetry/SWACollector';

import VisualizationGroup from '@splunk/dashboard-toolbar/groups/VisualizationGroup';
import ControlGroup from '@splunk/dashboard-toolbar/groups/ControlGroup';
import HistoryGroup from '@splunk/dashboard-toolbar/groups/HistoryGroup';
import ModeSwitch from '@splunk/dashboard-toolbar/buttons/ModeSwitch';
import EditorsControlGroup from '@splunk/dashboard-toolbar/groups/EditorsControlGroup';
import ExportDashboardButton from '@splunk/dashboard-toolbar/buttons/ExportDashboardButton';
import {
  CloneButton,
  DeleteButton,
  LayerButton,
  OpenSearchButton,
  RefreshButton,
  FullscreenButton,
  ExportButton,
} from '@splunk/dashboard-action-buttons';
import ToastMessages from '@splunk/react-toast-notifications/ToastMessages';
import Toaster, { makeCreateToast } from '@splunk/react-toast-notifications/Toaster';
import { createSchemaBasedOnPresets } from '@splunk/dashboard-definition/DashboardSchema';
import T from 'prop-types';

import { prettyJsonString, openQueryInSearch } from '../utils';
import ThemeButton from './ThemeButton';
import useView from '../hooks/useView';

const swaCollector = new SWACollector();

const BaseDashboard = ({ page }) => {
  const [mode, setMode] = useState('view');
  const [edittingSource, setEdittingSource] = useState(false);
  const [sourceCode, setSourceCode] = useState('');
  const [dashboardApi, setDashboardApi] = useState();
  const [tokenBinding, setTokenBinding] = useState({});
  const [currentTheme, setTheme] = useState('enterprise');
  const { canEdit, handleDefinitionChange, definition, fetching } = useView(page);

  useEffect(() => {
    if (definition) {
      setSourceCode(prettyJsonString(JSON.stringify(definition)));
    }
  }, [definition]);

  const vizEventHandler = event => {
    if (event.type === 'point.click' || event.type === 'value.click') {
      const { tokens } = definition;
      const vizId = event.targetId;
      if (vizId in tokens) {
        setTokenBinding(oldTokenBinding => {
          let bindingCopy = oldTokenBinding;
          Object.keys(tokens[vizId]).map(tokenKey => {
            const namespace = tokens[vizId][tokenKey].namespace || 'default';
            const key = tokens[vizId][tokenKey].key || 'value';
            bindingCopy = {
              ...bindingCopy,
              [namespace]: {
                ...bindingCopy[namespace],
                [tokenKey]: event.payload[key],
              },
            };
          });
          return bindingCopy;
        });
      }
    }
  };

  const handleModeChange = useCallback(newMode => {
    setMode(newMode);
  }, []);

  const enterSourceEditor = () => {
    setEdittingSource(true);
  };

  const exitSourceEditor = () => {
    if (sourceCode) {
      try {
        const parsedDefinition = JSON.parse(sourceCode);
        handleDefinitionChange(parsedDefinition);
        setEdittingSource(false);
      } catch (e) {
        // TODO: show error?
      }
    } else {
      setEdittingSource(false);
    }
  };
  const handleSearchClick = data => {
    openQueryInSearch(data.options.query, { ...data.options.queryParameters });
  };

  const handleLinkToUrl = useCallback(event => {
    if (event.url === '/dev/null') {
      event.preventDefault();
    }
  }, []);

  const dashboardPlugin = {
    onEventTrigger: vizEventHandler,
    onLinkToUrl: handleLinkToUrl,
  };

  const createToast = useMemo(() => makeCreateToast(Toaster), []);

  const iconRegistry = useMemo(() => {
    const ir = IconRegistry.create();
    ir.addDefaultProvider(new LocalIconProvider());
    ir.addProvider(new StandardIconProvider());
    return ir;
  }, []);

  // terrible hack because dashboard does not update after initialTokenBinding changes
  // and eventHandlers in the preset aren't working :(
  useEffect(() => {
    if (dashboardApi && dashboardApi.dashboard && dashboardApi.dashboard.handleTokenBindingChange) {
      dashboardApi.dashboard.handleTokenBindingChange(tokenBinding);
    }
  }, [tokenBinding, dashboardApi]);

  const handleDashboardApiRef = useCallback(ref => {
    setDashboardApi(ref);
  }, []);

  const toolbarMenus = useMemo(() => {
    const viewButtons = [
      <ControlGroup key="control" />,
      <ExportDashboardButton
        key="export"
        align="right"
        dashboardApi={dashboardApi}
        createToast={createToast}
      />,
    ];
    if (canEdit) {
      viewButtons.push(<ModeSwitch key="mode" align="right" />);
    }
    return {
      view: viewButtons,
      edit: [
        <HistoryGroup key="history" />,
        <VisualizationGroup key="visualization" />,
        <EditorsControlGroup key="editor" sourceButtonOnClick={enterSourceEditor} />,
        <ThemeButton onChange={setTheme} currentTheme={currentTheme} key="changeTheme" align="right" />,
        <ModeSwitch key="mode" align="right" />,
      ],
    };
  }, [enterSourceEditor, dashboardApi, createToast, canEdit]);

  const actionMenus = useMemo(
    () => ({
      view: [
        <OpenSearchButton onOpenSearchClick={handleSearchClick} key="search" />,
        <RefreshButton key="refresh" />,
        <FullscreenButton key="fullscreen" />,
        <ExportButton key="exportviz" />,
      ],
      edit: [<LayerButton key="layer" />, <CloneButton key="clone" />, <DeleteButton key="delete" />],
    }),
    [handleSearchClick]
  );

  const theme = {
    ...presetThemes[currentTheme],
    ...dashboardThemes[currentTheme],
    ...reactUIThemes[currentTheme],
    ...sourceEditorThemes[currentTheme],
  };

  let body = <WaitSpinner size="medium" />;

  if (definition && !fetching) {
    body = (
      <Dashboard
        width="100%"
        height="calc(100vh - 80px)"
        initialMode={mode}
        onModeChange={handleModeChange}
        onDefinitionChange={handleDefinitionChange}
        initialDefinition={definition}
        toolbarItems={toolbarMenus[mode]}
        actionMenus={actionMenus[mode]}
        preset={CustomPreset}
        dashboardApiRef={handleDashboardApiRef}
        dashboardPlugin={dashboardPlugin}
        initialTokenBinding={tokenBinding}
      />
    );
  }
  if (edittingSource && !fetching) {
    body = (
      <SourceEditor
        height="calc(100vh - 70px)"
        width="100%"
        source={sourceCode}
        onExit={exitSourceEditor}
        schema={createSchemaBasedOnPresets(EnterprisePreset)}
        onSourceChange={setSourceCode}
        title={definition.title}
      />
    );
  }

  return (
    <TelemetryContextProvider>
      <DashboardContextProvider
        iconRegistry={iconRegistry}
        enableVizSourceEditor={false}
        featureFlags={{
          enableImageFileUpload: false,
          enableVizSourceEditor: true,
          enableVizIdEditor: true,
        }}
        metricsCollectors={[swaCollector]}
      >
        <ThemeProvider theme={theme}>{body}</ThemeProvider>
        <ToastMessages />
      </DashboardContextProvider>
    </TelemetryContextProvider>
  );
};

BaseDashboard.propTypes = {
  page: T.string.isRequired,
};

export default BaseDashboard;
