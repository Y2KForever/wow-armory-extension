import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import middy, { type MiddyfiedHandler } from '@middy/core';
import errorLogger from '@middy/error-logger';
import type { Handler } from 'aws-lambda';
import { logger, tracer } from './powertools';

const middyShared = <THandler extends Handler>(
  lambdaHandler: THandler,
  logEvent = false,
): MiddyfiedHandler<Parameters<THandler>[0], ReturnType<THandler>> =>
  middy<Parameters<THandler>[0], ReturnType<THandler>>(lambdaHandler)
    .use(injectLambdaContext(logger, { logEvent, clearState: true }))
    .use(captureLambdaHandler(tracer));

export const middyCore = <THandler extends Handler>(lambdaHandler: THandler, logEvent = false) =>
  middyShared(lambdaHandler, logEvent).use(
    errorLogger({
      logger: (error) => logger.error('Something went wrong...', error),
    }),
  );
