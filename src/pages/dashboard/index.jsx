import React from 'react';
import layout from '@splunk/react-page';
import { BaseDashboard } from '../../components';
import {id} from '../../../appConfig';

const pageId = window.location.href.split(`${id}/`).pop()

const DashboardContainer = () => {
  return <BaseDashboard page={pageId} />;
};

layout(<DashboardContainer />, {
  pageTitle: 'Splunk Infrastructure Monitoring Dashboards',
  hideFooter: true,
  layout: 'fixed',
});
