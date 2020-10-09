import { MetricsCollector } from '@splunk/dashboard-telemetry/MetricsCollector';

export class MyCollector extends MetricsCollector {
    sendEvent(event) {
        console.info('SFX Dashboard event:', event);
    }
}
