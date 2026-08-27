import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware';
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware';
import middy, { type MiddlewareObj, type MiddyfiedHandler } from '@middy/core';
import errorLogger from '@middy/error-logger';
import httpErrorHandler from '@middy/http-error-handler';
import type { Handler } from 'aws-lambda';
import { logger, tracer } from './powertools';
import { corsHeaders } from './utils';

const errorCorsHeaders: MiddlewareObj = {
  onError: (request) => {
    if (request.response === undefined) return;
    request.response.headers = { ...corsHeaders, ...request.response.headers };
  },
};

const middyShared = <THandler extends Handler>(
  lambdaHandler: THandler,
  logEvent = false,
): MiddyfiedHandler<Parameters<THandler>[0], ReturnType<THandler>> =>
  middy<Parameters<THandler>[0], ReturnType<THandler>>(lambdaHandler)
    .use(injectLambdaContext(logger, { logEvent, clearState: true }))
    .use(captureLambdaHandler(tracer));

export const middyCore = <THandler extends Handler>(lambdaHandler: THandler, logEvent = false) =>
  middyShared(lambdaHandler, logEvent)
    .use(
      errorLogger({
        logger: (error) => logger.error('Something went wrong...', error),
      }),
    )
    .use(errorCorsHeaders)
    .use(
      httpErrorHandler({
        logger: false,
        fallbackMessage: JSON.stringify({ error: 'Something went wrong' }),
      }),
    );
