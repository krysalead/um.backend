import { Schema, Document, model } from "mongoose";

import { Traceable, makeTraceable } from "../interfaces/Traceable";

////////////////////////////////////////////////////////////////////////////////
// Model
////////////////////////////////////////////////////////////////////////////////

export interface DAOModelUserAuth {
  // references --------------------------------------------------------------
  // properties --------------------------------------------------------------
  login: string;
  password: string;
  channel: string;
  roles: string[];
  validated: boolean;
  locked: Date;
  isMigrated: boolean;
  lastLogin: Date;
  documentToObject: Function;
}

const schemaUserAuth = new Schema(
  makeTraceable({
    // references --------------------------------------------------------------
    // properties --------------------------------------------------------------
    login: String,
    password: String,
    channel: String,
    roles: [String],
    validated: Boolean,
    locked: Date,
    isMigrated: Boolean,
    lastLogin: Date
  })
);

/*tslint:disable:no-invalid-this*/
schemaUserAuth.method("documentToObject", function() {
  return {
    id: this._id,
    login: this.login,
    password: this.password,
    roles: this.roles,
    channel: this.channel,
    validated: this.validated,
    locked: this.locked,
    isMigrated: this.isMigrated
  };
});

schemaUserAuth.pre("save", function(next) {
  if (this.isNew) {
    this.createdAt = this.updatedAt = Date.now();
  } else {
    this.updatedAt = Date.now();
  }
  next();
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
  "UserAuth",
  schemaUserAuth
);
