import React from 'react';
import Select from '@splunk/react-ui/Select';
import T from 'prop-types';

const ThemeButton = ({ currentTheme, onChange }) => (
  <Select value={currentTheme} onChange={(e, { value }) => onChange(value)}>
    <Select.Option label="Light" value="enterprise" />
    <Select.Option label="Dark" value="enterpriseDark" />
  </Select>
);

ThemeButton.propTypes = {
  currentTheme: T.oneOf(['enterprise', 'enterpriseDark']).isRequired,
  onChange: T.func.isRequired,
};

export default ThemeButton;
