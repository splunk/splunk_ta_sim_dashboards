import EnterprisePreset from '@splunk/dashboard-presets/EnterprisePreset';
import CustomMultiInput from './CustomMultiInput';

const CustomPreset = {
    ...EnterprisePreset,
    inputs: {
        ...EnterprisePreset.inputs,
        'input.custom_multiselect': CustomMultiInput,
    },
    dataSources: {
        ...EnterprisePreset.dataSources,
    },
}

export default CustomPreset;