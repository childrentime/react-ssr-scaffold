export function parseQuery(
  queryString: string
): Record<string, string | string[]> {
  const queryObject: Record<string, string | string[]> = {};
  if (queryString) {
    queryString = queryString.trim().replace(/^\?/, "");
    const queryArray = queryString.split("&");
    for (let i = 0; i < queryArray.length; i++) {
      const kvPair = queryArray[i].split("=");
      if (kvPair.length > 1) {
        const key = decodeURIComponent(kvPair[0]);
        const value = decodeURIComponent(kvPair[1].replace(/\+/g, " "));
        if (queryObject[key] === undefined) {
          queryObject[key] = value;
        } else if (Array.isArray(queryObject[key])) {
          // @ts-expect-error
          queryObject[key].push(value);
        } else {
          // @ts-ignore
          queryObject[key] = [queryObject[key], value];
        }
      }
    }
  }
  return queryObject;
}
