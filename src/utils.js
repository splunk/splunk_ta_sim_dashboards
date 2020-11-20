/**
 * Copyright 2020 Splunk Inc.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * @license Apache-2.0
 */

import { defaultFetchInit } from '@splunk/splunk-utils/fetch';
import { app, username } from '@splunk/splunk-utils/config';
import { createRESTURL } from '@splunk/splunk-utils/url';
import lodashmerge from 'lodash/merge';
import { tokenize } from '@prantlf/jsonlint';
import { print as jsonPrint } from '@prantlf/jsonlint/lib/printer';
import { escape, unescape } from 'lodash';

/**
 * helper for making calls to splunk REST endpoint with given params,
 * appends default splunk headers to the request
 * @param {string} url
 * @param {"POST" | "GET" | "PUT" | "DELETE"} method
 * @param {any} body - (optional) request body for request, not valid for GET and DELETE calls
 */
export const makeRequest = (url, method = 'GET', body = null, postJson = false) => {
  return new Promise((resolve, reject) => {
    const callUrl = `${url}?output_mode=json&count=0`;
    let requestBody;
    let jsonHeader = {};
    if (body) {
      if (postJson) {
        jsonHeader = {
          headers: {
            'Content-Type': 'application/json',
          },
        };
        requestBody = JSON.stringify(body);
      } else {
        requestBody = new URLSearchParams();
        Object.entries(body).forEach(([key, value]) => requestBody.append(key, value));
      }
    }
    const fetchOptions = lodashmerge({}, defaultFetchInit, jsonHeader, { method }, { body: requestBody });
    fetch(callUrl, fetchOptions)
      .then(response => {
        console.log(response);
        if (response.ok) {
          response.json().then(data => resolve(data));
        } else if (response.status === 404) {
          reject(new Error('Not Found'));
        } else {
          reject(new Error(response.statusText));
        }
      })
      .catch(error => reject(error));
  });
};

export const getViewData = page => {
  return new Promise((res, rej) => {
    makeRequest(
      createRESTURL(`data/ui/views/${page}`, {
        app,
        owner: username,
      })
    )
      .then(response => {
        const parser = new DOMParser();
        const entry = response.entry[0];
        const canEdit = entry.acl.can_write;
        const xmlString = entry.content['eai:data'];
        const xmlDom = parser.parseFromString(xmlString, 'text/xml');
        const defs = xmlDom.documentElement.getElementsByTagName('definition');
        let rawDef;
        if (defs.length > 0) {
          rawDef = unescape(defs[0].innerHTML);
        }
        res({
          canEdit,
          definition: rawDef ? JSON.parse(rawDef) : null,
        });
      })
      .catch(err => rej(err));
  });
};

export const saveView = (page, newDefinition) => {
  return new Promise((res, rej) => {
    const escapedDefinition = escape(JSON.stringify(newDefinition));
    const rawXml = `<?xml version="1.0"?>
    <view template="splunk_sim_dashboards:/templates/dashboard.html" type="html">
        <label>${escape(newDefinition.title)}</label>
        <definition>${escapedDefinition}</definition>
    </view>`;
    makeRequest(
      createRESTURL(`data/ui/views/${page}`, {
        app,
        owner: 'nobody',
      }),
      'POST',
      {
        'eai:data': rawXml,
      }
    )
      .then(() => {
        res(true);
      })
      .catch(err => rej(err));
  });
};

export const prettyJsonString = jsonString => {
  const tokens = tokenize(jsonString, { rawTokens: true });
  return jsonPrint(tokens, { indent: 4 });
};

export const openQueryInSearch = (query, { earliest, latest }) => {
  try {
    const earliestTime = earliest || '-24h';
    const latestTime = latest || 'now';
    const searchQuery = query[0] === '|' ? query : `search ${query}`;
    const encodedQuery = encodeURIComponent(searchQuery);
    const currentUrl = window.location.href;
    const appRootPosition = currentUrl.indexOf(app) + app.length;
    const appRootUrl = currentUrl.slice(0, appRootPosition);
    const searchUrl = `${appRootUrl}/search?q=${encodedQuery}&earliest=${earliestTime}&latest=${latestTime}`;
    window.open(searchUrl, '_blank');
    // eslint-disable-next-line no-empty
  } catch (e) {}
};
