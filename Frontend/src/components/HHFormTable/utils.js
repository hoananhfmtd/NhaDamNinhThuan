import { cloneDeep, isEmpty, isObject } from "lodash";

export function mergeObjectsWithDefaults(obj1, obj2) {
  for (const key in obj1) {
    if (!(key in obj2)) {
      if (typeof obj1[key] === 'string') {
        obj2[key] = obj1[key];
      } else if (typeof obj1[key] === 'number') {
        obj2[key] = 0;
      } else if (typeof obj1[key] === 'object' && obj1[key] !== null) {
        obj2[key] = Array.isArray(obj1[key]) ? [] : {};
        mergeObjectsWithDefaults(obj1[key], obj2[key]);
      } else {
        obj2[key] = null; // Giá trị mặc định cho các kiểu khác
      }
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null) {
      // Đệ quy để xử lý các object lồng nhau
      mergeObjectsWithDefaults(obj1[key], obj2[key]);
    }
  }
  return obj2;
}


const removeEmptyObject = (obj) => {
  if (isEmpty(obj)) return;
  Object.keys(obj).forEach((key) => {
    if (obj[key] instanceof Date) {
      // format date to ISO 8601 string
      obj[key] = obj[key].toISOString();
      return;
    }
    if (isObject(obj[key])) {
      if (Array.isArray(obj[key])) return;
      if (isEmpty(obj[key])) {
        delete obj[key];
      } else {
        removeEmptyObject(obj[key]);
        if (isEmpty(obj[key])) {
          delete obj[key];
        }
      }
    } else if (obj[key] === null || obj[key] === undefined || obj[key] === "") {
      delete obj[key];
    }
  });
  return obj;
};

export const removeEmpty = (obj) => {
  const clonedObj = cloneDeep(obj);
  removeEmptyObject(clonedObj);
  return clonedObj;
};
