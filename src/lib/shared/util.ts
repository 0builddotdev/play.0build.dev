/** Own-property check. Unlike `key in obj`, it ignores `constructor`, `toString`, etc. */
export const has = (obj: object, key: string): boolean =>
	Object.prototype.hasOwnProperty.call(obj, key);
