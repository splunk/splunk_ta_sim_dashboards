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

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_DEFINITION } from '@splunk/dashboard-definition/DashboardDefinition';
import debounce from 'lodash/debounce';

import { getViewData, saveView } from '../utils';

const useView = page => {
  const [canEdit, setCanEdit] = useState(false);
  const [definition, setDefinition] = useState(DEFAULT_DEFINITION);
  const [fetching, setFetching] = useState(true);

  const saveDef = newDefinition => {
    saveView(page, newDefinition);
  };

  const saveDefinition = useCallback(debounce(saveDef, 1000), []);

  const handleDefinitionChange = newDef => {
    setDefinition(newDef);
    saveDefinition(newDef);
  };

  useEffect(() => {
    setFetching(true);
    getViewData(page).then(result => {
      if (result) {
        if (result.definition) {
          setDefinition(result.definition);
        }
        if (result.canEdit) {
          setCanEdit(result.canEdit);
        }
        setFetching(false);
      }
    });
  }, []);

  return {
    canEdit,
    saveDefinition,
    definition,
    handleDefinitionChange,
    fetching,
  };
};

export default useView;
