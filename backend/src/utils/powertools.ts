import { LogFormatter, LogItem, Logger } from '@aws-lambda-powertools/logger';
import type { LogAttributes, UnformattedAttributes } from '@aws-lambda-powertools/logger/types';
import { Tracer } from '@aws-lambda-powertools/tracer';

type CustomLogEntry = {
  level: string;
  message: string;
  service: string;
  correlationIds: {
    awsRequestId?: string;
    xRayTraceId?: string;
  };
  timestamp: string;
};

class CustomLogFormatter extends LogFormatter {
  public formatAttributes(attributes: UnformattedAttributes, additionalLogAttributes: LogAttributes): LogItem {
    const baseAttributes: CustomLogEntry = {
      level: attributes.logLevel,
      message: attributes.message,
      service: attributes.serviceName,
      correlationIds: {
        awsRequestId: attributes.lambdaContext?.awsRequestId,
        xRayTraceId: attributes.xRayTraceId,
      },
      timestamp: this.formatTimestamp(attributes.timestamp),
    };

    const logItem = new LogItem({ attributes: baseAttributes });
    logItem.addAttributes(additionalLogAttributes);

    return logItem;
  }
}

const logger = new Logger({ logFormatter: new CustomLogFormatter() });
const tracer = new Tracer();
tracer.provider.setLogger(logger);

export { logger, tracer };
