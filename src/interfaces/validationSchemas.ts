import { Schema } from 'joi';

export interface ValidationSchemas {
  'body'?: Schema;
  'params'?: Schema;
  'query'?: Schema;
};
