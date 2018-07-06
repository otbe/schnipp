import { DynamoDB } from 'aws-sdk';
import { DataMapper } from '@aws/dynamodb-data-mapper';

export const createMapper = () => {
  const client = new DynamoDB(
    process.env.IS_OFFLINE
      ? {
          region: 'localhost',
          endpoint: 'http://localhost:8000'
        }
      : {}
  );

  return new DataMapper({ client });
};
