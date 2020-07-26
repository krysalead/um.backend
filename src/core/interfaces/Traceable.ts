export interface Traceable {
  createdAt: Date;
  updatedAt: Date;
}

export interface Enhanced{
documentToObject: Function;
}

export function makeTraceable(json) {
  json['createdAt'] = { type: Date, default: Date.now };
  json['updatedAt'] = { type: Date, default: Date.now };
  return json;
}

export function hookTraceability(schema){
  schema.pre('save', function(next) {
    this.createdAt = this.updatedAt = Date.now();
    next();
  });
  schema.pre('findOneAndUpdate', function() {
    this.update({},{ $set: { updatedAt: Date.now() } });
  });
}

export function enhanceSchema(schema){
  schema.method('documentToObject', function() {
    let that = JSON.parse(JSON.stringify(this));
    delete that['__v'];
    that.id= that._id.toString();
    delete that['_id'];
    return that;
  });
  return schema;
}