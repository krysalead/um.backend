import { Schema, Document, model } from 'mongoose';

import { Traceable, makeTraceable } from '../interfaces/Traceable';

////////////////////////////////////////////////////////////////////////////////
// Model
////////////////////////////////////////////////////////////////////////////////

export interface DAOModelUserAuth {
  // references --------------------------------------------------------------
  // properties --------------------------------------------------------------
  login: string;
  password: string;
  channel: string;
  role: string[];
  validated: boolean;
  locked: Date;
}

const schemaUserAuth = makeTraceable({
  // references --------------------------------------------------------------
  // properties --------------------------------------------------------------
  login: String,
  password: String,
  channel: String,
  role: [String],
  validated: Boolean,
  locked: Date
});

////////////////////////////////////////////////////////////////////////////////
// Instance
////////////////////////////////////////////////////////////////////////////////

export interface DAODocumentUserAuth
  extends DAOModelUserAuth,
    Traceable,
    Document {}

// tslint:disable-next-line:variable-name
export const DAOUserAuth = model<DAODocumentUserAuth>(
  'UserAuth',
  new Schema(schemaUserAuth)
);
