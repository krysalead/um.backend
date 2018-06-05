export interface Traceable {
  createdAt: Date;
  updatedAt: Date;
}

export function makeTraceable(json) {
  json['createdAt'] = Date;
  json['updatedAt'] = Date;
  return json;
}
