import { APIGatewayProxyEventHeaders } from 'aws-lambda';
import crypto from 'crypto';

export const simplifyDynamoDBResponse = (dynamoResponse: any): any => {
  if (!dynamoResponse) {
    return null;
  }

  if (Array.isArray(dynamoResponse)) {
    return dynamoResponse.map((item) => simplifyDynamoDBResponse(item));
  }

  if (dynamoResponse.M !== undefined) {
    return simplifyDynamoDBResponse(dynamoResponse.M);
  }

  const simplifiedResponse: Record<string, any> = {};

  for (const key in dynamoResponse) {
    const value = dynamoResponse[key];

    if (value.S !== undefined) {
      simplifiedResponse[key] = value.S;
    } else if (value.BOOL !== undefined) {
      simplifiedResponse[key] = value.BOOL;
    } else if (value.N !== undefined) {
      simplifiedResponse[key] = parseFloat(value.N);
    } else if (value.L !== undefined) {
      simplifiedResponse[key] = value.L.map((item: any) => simplifyDynamoDBResponse(item));
    } else if (value.M !== undefined) {
      simplifiedResponse[key] = simplifyDynamoDBResponse(value.M);
    } else if (value.NULL !== undefined) {
      simplifiedResponse[key] = null;
    }
  }

  return simplifiedResponse;
};

export const convertToDynamoDBFormat = (data: any, isNested: boolean = false): any => {
  if (typeof data === 'string') {
    return { S: data };
  } else if (typeof data === 'number') {
    return { N: data.toString() };
  } else if (typeof data === 'boolean') {
    return { BOOL: data };
  } else if (data === null) {
    return { NULL: true };
  } else if (Array.isArray(data)) {
    return { L: data.map((item) => convertToDynamoDBFormat(item, true)) };
  } else if (typeof data === 'object') {
    const dynamoDBFormatted: Record<string, any> = {};
    for (const key in data) {
      dynamoDBFormatted[key] = convertToDynamoDBFormat(data[key], true);
    }
    return isNested ? { M: dynamoDBFormatted } : dynamoDBFormatted;
  } else {
    throw new Error(`Unsupported data type: ${typeof data}`);
  }
};

export const ApiResult = (status: number, body: string) => {
  return {
    statusCode: status,
    body: body,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': '*',
      'Access-Control-Allow-Methods': '*',
    },
  };
};

export const parseCustomDate = (dateStr: string): Date => {
  const cleanedDateStr = dateStr.replace(/(\d+)(th|st|nd|rd)/, '$1');
  return new Date(cleanedDateStr);
};

export const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const controlHeaders = (headers: APIGatewayProxyEventHeaders, requiredHeaders: string[]): Boolean => {
  for (const header of requiredHeaders) {
    if (!headers[header]) {
      return false;
    }
  }
  return true;
};

export const generateRandomState = (length: number = 32): string => {
  if (length <= 0) {
    throw new Error('State length must be greater than 0');
  }
  return crypto.randomBytes(length).toString('base64url').slice(0, length);
};
