import * as mongoose from "mongoose";

export type ArrayAsyncMappingFunction<Item, Mapped = Item> = (
  item: Item,
  index?: number,
  array?: Item[]
) => Promise<Mapped>;

export async function asyncMap<Item, Mapped = Item>(
  array: Item[],
  mapper: ArrayAsyncMappingFunction<Item, Mapped>
): Promise<Mapped[]> {
  const result = [];
  for (let index = 0, length = array.length; index < length; index++) {
    result[index] = await mapper(array[index], index, array);
  }
  return result;
}

export async function asyncEach<Item>(
  array: Item[],
  callback: (item: Item, index?: number, array?: Item[]) => Promise<any>
): Promise<Item[]> {
  asyncMap<Item, any>(array, callback);
  return array;
}

export async function syncEach<Item>(
  array: Item[],
  callback: (item: Item, index?: number, array?: Item[]) => Promise<any>
): Promise<Item[]> {
  return _callNext<Item>(0, array, callback);
}

function _callNext<Item>(index, array, callback): Promise<Item[]> {
  return callback(array[index], index, array).then(() => {
    if (index < array.length - 1) {
      return _callNext(++index, array, callback);
    }
    return array;
  });
}

/**
 * Allow to safely access an element of an object without testing every possible undefined element issues
 * @param {object} o object to go through
 * @param {string} path string a JSON path (i.e. a.b.c)
 * @param {string|boolean|number|object} [defaultValue=undefined] what to return in case of failure
 */
export function safeAccess(o, path, defaultValue) {
  if (isUndefined(o)) {
    return defaultValue;
  }
  var arr = path.split(".");
  for (var i = 0, j = arr, k = j.length, l = o; i < k; i++) {
    var key = j[i];
    if (key.indexOf("[") > -1) {
      var m = /(\w*)\[(\d*)\]/.exec(key);
      key = m[1];
      var t = key !== "" ? l[key] : l;
      if (isDefined(t) && isDefined(t[m[2]])) {
        l = t[m[2]];
      } else {
        if (typeof defaultValue === "function") {
          return defaultValue();
        } else {
          return defaultValue;
        }
      }
    } else {
      if (isDefined(l[key])) {
        l = l[key];
      } else {
        if (typeof defaultValue === "function") {
          return defaultValue();
        } else {
          return defaultValue;
        }
      }
    }
  }
  return l;
}

/**
 * Check if the object passed is not undefined and not null
 * @param {Object} o object to test
 * @returns {boolean} true if the object is defined
 */
export function isDefined(o) {
  return o !== null && o !== undefined;
}

/**
 * Check that the passed object is undefined, call the isDefined and take the opposite. This is more readble in the code
 * @param {Object} o the object to test
 */
export function isUndefined(o) {
  return !isDefined(o);
}

export function isId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

export function isFloat(possibleFloatValue) {
  return !isNaN(parseFloat(possibleFloatValue));
}
