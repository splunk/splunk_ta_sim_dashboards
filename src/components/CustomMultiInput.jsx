import React, {useState, useEffect, useMemo, useCallback }  from 'react';
import isEmpty from 'lodash/isEmpty';
import Multiselect from '@splunk/react-ui/Multiselect';
import { withCustomInputWrapper } from './Wrapper';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';

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
    const [searchStatusMessage,setStatusMessage] = useState("");

    const multiselectOptions = useMemo(() => {

        if(!isLoading){
            if (isEmpty(dataSources) || dataSources.primary === undefined || dataSources.primary.data === null){
                setStatusMessage("Error occured with dataSource");
                return true
            }
            
            if(dataSources.primary.data.columns.length === 0){
                setStatusMessage(dataSources.primary.meta.statusMessage);
                return true
            }

            if(dataSources.primary.meta.isDone == true){
                const primary = dataSources.primary.data.columns;
                const label = eval(encoding.label)
                const value = eval(encoding.value)
                
                if(label === undefined || value === undefined){
                    setStatusMessage("Error occured in encoding, ensure proper format (e.g. primary[0])");
                    return true
                }
                
                return label.map((item,idx) => (
                    <Multiselect.Option label={item} value={value[idx]} />
                ));
            }
        }

    }, [dataSources, isLoading]);

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
        <div>
        {!multiselectOptions && <div><WaitSpinner size="medium" screenReaderText={loadingMessage} /> </div>}
        {multiselectOptions &&
            <Multiselect 
                values={values} 
                inline 
                compact 
                onChange={handleValueChange} 
                placeholder={placeholder} 
                isLoadingOptions={isLoading} 
                loadingMessage={loadingMessage} 
                disabled={isDisabled || isError}
                footerMessage={searchStatusMessage}
            >
                {!isEmpty(items) &&
                    items.map(({ label, value }) => (
                        <Multiselect.Option label={label} value={value} />
                    ))
                }
                {multiselectOptions}
            </Multiselect>
        }
        </div>
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


export default withCustomInputWrapper(CustomMultiInput);