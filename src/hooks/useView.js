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
