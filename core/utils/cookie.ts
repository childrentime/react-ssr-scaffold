function decode(s: string) {
  return s.replace(/(%[0-9A-Z]{2})+/g, decodeURIComponent);
}

export function getCookie(key?: string) {
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  const jar = {} as Record<string, string>;

  cookies.some((v) => {
    const parts = v.split("=");
    let cookie = parts.slice(1).join("=");
    const name = decode(parts[0]);
    cookie = decode(cookie);
    jar[name] = cookie;
    return key === name;
  });

  return key ? jar[key] || "" : jar;
}

export function setCookie(
  key: string,
  value: string,
  attributes?: {
    path?: string;
    domain?: string;
    expires?: string;
    secure?: boolean;
    "max-age"?: string;
  }
) {
  // If no value offered, do nothing.
  if (value === undefined) {
    return "";
  }

  attributes = Object.assign({ path: "/" }, attributes);

  value = encodeURIComponent(value);
  key = encodeURIComponent(key);

  const stringifiedAttributes = Object.entries(attributes).reduce(
    (res, [attrName, attrValue]) => {
      if (!attrValue) {
        return res;
      }
      res += "; " + attrName;
      // The only valid case is: {secure: true}
      if (attrValue === true) {
        return res;
      }
      // Considers RFC 6265 section 5.2:
      // ...
      // 3.  If the remaining unparsed-attributes contains a %x3B (";")
      //     character:
      // Consume the characters of the unparsed-attributes up to,
      // not including, the first %x3B (";") character.
      // ...
      res += "=" + attrValue.split(";")[0];
      return res;
    },
    ""
  );

  return (document.cookie = key + "=" + value + stringifiedAttributes);
}

/**
 * 删除 cookie
 * @param {string} key 键名
 */
export function removeCookie(key: string) {
  setCookie(key, "", {
    "max-age": "-1",
  });
}
