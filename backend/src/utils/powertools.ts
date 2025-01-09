import { LogFormatter, Logger } from '@aws-lambda-powertools/logger';
import type { UnformattedAttributes } from '@aws-lambda-powertools/logger/lib/types';
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
  public formatAttributes(attributes: UnformattedAttributes): CustomLogEntry {
    return {
      level: attributes.logLevel,
      message: attributes.message,
      service: attributes.serviceName,
      correlationIds: {
        awsRequestId: attributes.lambdaContext?.awsRequestId,
        xRayTraceId: attributes.xRayTraceId,
      },
      timestamp: this.formatTimestamp(attributes.timestamp),
    };
  }
}

const logger = new Logger({ logFormatter: new CustomLogFormatter() });
const tracer = new Tracer();
tracer.provider.setLogger(logger);

export { logger, tracer };
