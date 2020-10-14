import React, {useState, useEffect, useMemo, useCallback }  from 'react';
import isEmpty from 'lodash/isEmpty';
import Multiselect from '@splunk/react-ui/Multiselect';
import { withInputWrapper } from './Wrapper';

const toValue = arr => (arr ? arr.join(',') : '');

const CustomMultiInput = ({
    value,
    options: { items = [], defaultValue },
    dataSources = {},
    encoding,
    onValueChange,
    loading: isLoading,
    isError,
    errorMessage,
    isDisabled,
    disabledMessage,
}) => {

    const [values, setValues] = useState([defaultValue]);
    const multiselectOptions = useMemo(() => {
        if (dataSources.primary.data !== null) {
            const primary = dataSources.primary.data.columns;
            const label = eval(encoding.label)
            const value = eval(encoding.value)

            return label.map((item,idx) => (
                <Multiselect.Option label={item} value={value[idx]} />
            ));
        }
    }, [dataSources]);

    const handleValueChange = useCallback(
        (evt, { values }) => {
            onValueChange(evt, toValue(values));
            setValues(values);
        },
        [onValueChange]
    );

    const placeholder = useMemo(() => {
        return _(errorMessage || disabledMessage || 'Select a value');
    }, [disabledMessage, errorMessage]);

    const loadingMessage = "Loading menu items...";

    return (
        <Multiselect 
        values={values} 
        inline 
        compact 
        onChange={handleValueChange} 
        placeholder={placeholder} 
        isLoadingOptions={isLoading} 
        loadingMessage={loadingMessage} 
        disabled={isDisabled || isError}
        animateLoading
        >
            {!isEmpty(items) &&
                items.map(({ label, value }) => (
                    <Multiselect.Option label={label} value={value} />
                ))
            }
            {multiselectOptions}
        </Multiselect>
    );
}


CustomMultiInput.valueToTokens = (value, { token }) => {
    if (!token) {
        return {};
    }
    if (!value) {
        return {
            [token]: null,
        };
    }
    return {
        [token]: `${value}`,
    };
};


export default withInputWrapper(CustomMultiInput);