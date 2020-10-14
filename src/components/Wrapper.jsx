import T from 'prop-types';
import React, { useMemo, useState } from 'react';
import styled, { css } from 'styled-components';
import Warning from '@splunk/react-icons/Warning';
import Tooltip from '@splunk/react-ui/Tooltip';
import { createThemeRegistry } from '@splunk/dashboard-themes/helper';

const themeRegistry = createThemeRegistry('@splunk/dashboard-inputs', 'InputWrapper');

const InputContainer = styled.div.attrs(() => ({
    'data-test': 'input-container',
}))`
    width: ${props => props.width}px;
    padding: 8px;
    position: relative;
    background-color: transparent;
    border-color: transparent;
    &:hover {
        background-color: ${props =>
            props.mode === 'edit' ? themeRegistry.themeVariable('backgroundColor') : 'transparent'};
    }
`;

const InputTitleRemoveContainer = styled.div.attrs(() => ({
    'data-test': 'input-title-remove-container',
}))`
    display: flex;
    margin-bottom: 4px;
    align-items: center;
`;

const InputTitle = styled.div.attrs(() => ({
    'data-test': 'input-title',
}))`
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    font-size: 13px;
    margin-right: 8px;
    cursor: default;
    color: ${themeRegistry.themeVariable('color')};
`;

const InputError = styled.div.attrs(() => ({
    'data-test': 'input-error',
}))`
    margin-right: 8px;
`;

const InputErrorIconContainer = styled.div.attrs(() => ({
    'data-test': 'input-error-icon',
}))`
    color: ${themeRegistry.themeVariable('errorIconColor')};
`;

export const withCustomInputWrapper = CustomMultiInputComponent => {
    const WrappedComponent = ({
        mode,
        title,
        id,
        options,
        isSelected,
        isError,
        errorMessage,
        width,
        onRemove,
        ...rest
    }) => {
        const { token } = options;
        const [currentWidth, setWidth] = useState(width);

        const titleMemo = useMemo(() => {
            const displayTitle = title || token || id;
            return <InputTitle title={displayTitle}>{displayTitle}</InputTitle>;
        }, [title, token, id]);

        const errorMemo = useMemo(() => {
            if (!isError) {
                return null;
            }
            return (
                <InputError>
                    <Tooltip content={errorMessage}>
                        <InputErrorIconContainer>
                            <Warning width="11px" height="11px" hideDefaultTooltip />
                        </InputErrorIconContainer>
                    </Tooltip>
                </InputError>
            );
        }, [isError, errorMessage]);

        return (
            <InputContainer mode={mode} isSelected={isSelected} width={currentWidth}>
                <InputTitleRemoveContainer>
                    {titleMemo}
                    {errorMemo}
                </InputTitleRemoveContainer>
                <CustomMultiInputComponent
                    id={id}
                    isSelected={isSelected}
                    options={options}
                    isError={isError}
                    errorMessage={errorMessage}
                    {...rest}
                />
            </InputContainer>
        );
    };

    WrappedComponent.valueToTokens = CustomMultiInputComponent.valueToTokens;
    WrappedComponent.schema = CustomMultiInputComponent.schema;
    WrappedComponent.meta = CustomMultiInputComponent.meta;
    WrappedComponent.dataContract = CustomMultiInputComponent.dataContract;
    WrappedComponent.propTypes = {
        mode: T.string,
        isSelected: T.bool,
        isError: T.bool,
        errorMessage: T.string,
        options: T.object,
        title: T.string,
        id: T.string,
        width: T.number,
        onRemove: T.func,
        rest: T.any,
    };

    WrappedComponent.defaultProps = {
        width: 180,
        options: {},
    };

    return WrappedComponent;
};

withCustomInputWrapper.propTypes = {
    withCustomInputWrapper: T.element,
};
