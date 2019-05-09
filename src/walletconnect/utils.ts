import isNumber from "lodash.isnumber";
import { keccak_256 } from "js-sha3";

import {
  ITxData,
  IClientMeta,
  IParseURIResult,
  IRequiredParamsResult,
  IQueryParamsResult,
  IJsonRpcResponseSuccess,
  IJsonRpcResponseError,
  IJsonRpcErrorMessage
} from "./types";

export function convertArrayBufferToBuffer(arrayBuffer: ArrayBuffer): Buffer {
  const hex = convertArrayBufferToHex(arrayBuffer);
  const result = convertHexToBuffer(hex);
  return result;
}

export function convertBufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
  const hex = convertBufferToHex(buffer);
  const result = convertHexToArrayBuffer(hex);
  return result;
}

export function convertUtf8ToBuffer(utf8: string): Buffer {
  const result = new Buffer(utf8, "utf8");
  return result;
}

export function convertBufferToUtf8(buffer: Buffer): string {
  const result = buffer.toString("utf8");
  return result;
}

export function convertBufferToHex(buffer: Buffer, prefix?: boolean): string {
  let result = buffer.toString("hex");
  if (prefix) {
    result = "0x" + result;
  }
  return result;
}

export function convertHexToBuffer(hex: string): Buffer {
  hex = hex.replace("0x", "");
  const result = new Buffer(hex, "hex");
  return result;
}

export function concatBuffers(...args: Buffer[]): Buffer {
  const hex: string = args.map(b => convertBufferToHex(b)).join("");
  const result: Buffer = convertHexToBuffer(hex);
  return result;
}

export function concatArrayBuffers(...args: ArrayBuffer[]): ArrayBuffer {
  const hex: string = args.map(b => convertArrayBufferToHex(b)).join("");
  const result: ArrayBuffer = convertHexToArrayBuffer(hex);
  return result;
}

export function convertArrayBufferToUtf8(arrayBuffer: ArrayBuffer): string {
  const array: Uint8Array = new Uint8Array(arrayBuffer);
  const chars: string[] = [];
  let i: number = 0;

  while (i < array.length) {
    const byte: number = array[i];
    if (byte < 128) {
      chars.push(String.fromCharCode(byte));
      i++;
    } else if (byte > 191 && byte < 224) {
      chars.push(
        String.fromCharCode(((byte & 0x1f) << 6) | (array[i + 1] & 0x3f))
      );
      i += 2;
    } else {
      chars.push(
        String.fromCharCode(
          ((byte & 0x0f) << 12) |
            ((array[i + 1] & 0x3f) << 6) |
            (array[i + 2] & 0x3f)
        )
      );
      i += 3;
    }
  }

  const utf8: string = chars.join("");
  return utf8;
}

export function convertUtf8ToArrayBuffer(utf8: string): ArrayBuffer {
  const bytes: number[] = [];

  let i = 0;
  utf8 = encodeURI(utf8);
  while (i < utf8.length) {
    const byte: number = utf8.charCodeAt(i++);
    if (byte === 37) {
      bytes.push(parseInt(utf8.substr(i, 2), 16));
      i += 2;
    } else {
      bytes.push(byte);
    }
  }

  const array: Uint8Array = new Uint8Array(bytes);
  const arrayBuffer: ArrayBuffer = array.buffer;
  return arrayBuffer;
}

export function convertArrayBufferToHex(
  arrayBuffer: ArrayBuffer,
  prefix?: boolean
): string {
  const array: Uint8Array = new Uint8Array(arrayBuffer);
  const HEX_CHARS: string = "0123456789abcdef";
  const bytes: string[] = [];
  for (let i = 0; i < array.length; i++) {
    const byte = array[i];
    bytes.push(HEX_CHARS[(byte & 0xf0) >> 4] + HEX_CHARS[byte & 0x0f]);
  }
  let hex: string = bytes.join("");
  if (prefix) {
    hex = "0x" + hex;
  }
  return hex;
}

export function convertHexToArrayBuffer(hex: string): ArrayBuffer {
  hex = hex.replace("0x", "");

  const bytes: number[] = [];

  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }

  const array: Uint8Array = new Uint8Array(bytes);
  const arrayBuffer: ArrayBuffer = array.buffer;
  return arrayBuffer;
}

export function convertUtf8ToHex(utf8: string, prefix?: boolean): string {
  const arrayBuffer = convertUtf8ToArrayBuffer(utf8);
  let hex = convertArrayBufferToHex(arrayBuffer);
  if (prefix) {
    hex = "0x" + hex;
  }
  return hex;
}

export function convertHexToUtf8(hex: string): string {
  const arrayBuffer = convertHexToArrayBuffer(hex);
  const utf8 = convertArrayBufferToUtf8(arrayBuffer);
  return utf8;
}

export function payloadId(): number {
  const datePart: number = new Date().getTime() * Math.pow(10, 3);
  const extraPart: number = Math.floor(Math.random() * Math.pow(10, 3));
  const id: number = datePart + extraPart;
  return id;
}

export function uuid(): string {
  const result: string = ((a?: any, b?: any) => {
    for (
      b = a = "";
      a++ < 36;
      b +=
        (a * 51) & 52
          ? (a ^ 15 ? 8 ^ (Math.random() * (a ^ 20 ? 16 : 4)) : 4).toString(16)
          : "-"
    ) {
      // empty
    }
    return b;
  })();
  return result;
}

export const isHexStrict = (hex: string) => {
  return (
    (typeof hex === "string" || isNumber(hex)) && /^(-)?0x[0-9a-f]*$/i.test(hex)
  );
};

export function keccak256(data?: string): string {
  if (!data) {
    return "";
  }
  return "0x" + keccak_256(data);
}

export const toChecksumAddress = (address: string) => {
  if (typeof address === "undefined") {
    return "";
  }

  address = address.toLowerCase().replace("0x", "");
  const addressHash = keccak256(address).replace("0x", "");
  let checksumAddress = "0x";

  for (let i = 0; i < address.length; i++) {
    if (parseInt(addressHash[i], 16) > 7) {
      checksumAddress += address[i].toUpperCase();
    } else {
      checksumAddress += address[i];
    }
  }
  return checksumAddress;
};

export const isValidAddress = (address?: string) => {
  if (!address) {
    return false;
  } else if (address.toLowerCase().substring(0, 2) !== "0x") {
    return false;
  } else if (!/^(0x)?[0-9a-f]{40}$/i.test(address)) {
    return false;
  } else if (
    /^(0x)?[0-9a-f]{40}$/.test(address) ||
    /^(0x)?[0-9A-F]{40}$/.test(address)
  ) {
    return true;
  } else {
    return address === toChecksumAddress(address);
  }
};

export function getMeta(): IClientMeta | null {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined" ||
    typeof window.location === "undefined"
  ) {
    return null;
  }

  function getIcons(): string[] {
    const links: HTMLCollectionOf<
      HTMLLinkElement
    > = document.getElementsByTagName("link");
    const icons: string[] = [];

    for (let i = 0; i < links.length; i++) {
      const link: HTMLLinkElement = links[i];

      const rel: string | null = link.getAttribute("rel");
      if (rel) {
        if (rel.toLowerCase().indexOf("icon") > -1) {
          const href: string | null = link.getAttribute("href");

          if (href) {
            if (
              href.toLowerCase().indexOf("https:") === -1 &&
              href.toLowerCase().indexOf("http:") === -1 &&
              href.indexOf("//") !== 0
            ) {
              let absoluteHref: string =
                window.location.protocol + "//" + window.location.host;

              if (href.indexOf("/") === 0) {
                absoluteHref += href;
              } else {
                const path: string[] = window.location.pathname.split("/");
                path.pop();
                const finalPath: string = path.join("/");
                absoluteHref += finalPath + "/" + href;
              }

              icons.push(absoluteHref);
            } else if (href.indexOf("//") === 0) {
              const absoluteUrl: string = window.location.protocol + href;

              icons.push(absoluteUrl);
            } else {
              icons.push(href);
            }
          }
        }
      }
    }

    return icons;
  }

  function getMetaOfAny(...args: string[]): string {
    const metaTags: HTMLCollectionOf<
      HTMLMetaElement
    > = document.getElementsByTagName("meta");

    for (let i = 0; i < metaTags.length; i++) {
      const tag: HTMLMetaElement = metaTags[i];
      const attributes: Array<string | null> = ["itemprop", "property", "name"]
        .map(target => tag.getAttribute(target))
        .filter(attr => {
          if (attr) {
            args.includes(attr);
          }
        });

      if (attributes.length && attributes) {
        const content: string | null = tag.getAttribute("content");
        if (content) {
          return content;
        }
      }
    }

    return "";
  }

  function getName(): string {
    let name: string = getMetaOfAny(
      "name",
      "og:site_name",
      "og:title",
      "twitter:title"
    );

    if (!name) {
      name = document.title;
    }

    return name;
  }

  function getDescription(): string {
    const description: string = getMetaOfAny(
      "description",
      "og:description",
      "twitter:description",
      "keywords"
    );

    return description;
  }

  const name: string = getName();
  const description: string = getDescription();
  const url: string = window.location.origin;
  const icons: string[] = getIcons();

  const meta: IClientMeta = {
    description,
    url,
    icons,
    name
  };

  return meta;
}

export function parseWalletConnectUri(str: string): IParseURIResult {
  const pathStart: number = str.indexOf(":");

  const pathEnd: number | undefined =
    str.indexOf("?") !== -1 ? str.indexOf("?") : undefined;

  const protocol: string = str.substring(0, pathStart);

  const path: string = str.substring(pathStart + 1, pathEnd);

  function parseRequiredParams(path: string): IRequiredParamsResult {
    const separator = "@";

    const values = path.split(separator);

    const requiredParams = {
      handshakeTopic: values[0],
      version: parseInt(values[1], 10)
    };

    return requiredParams;
  }

  const requiredParams: IRequiredParamsResult = parseRequiredParams(path);

  const queryString: string =
    typeof pathEnd !== "undefined" ? str.substr(pathEnd) : "";

  function parseQueryParams(queryString: string): IQueryParamsResult {
    const result: any = {};

    const pairs = (queryString[0] === "?"
      ? queryString.substr(1)
      : queryString
    ).split("&");

    for (let i = 0; i < pairs.length; i++) {
      const keyArr: string[] = pairs[i].match(/\w+(?==)/i) || [];
      const valueArr: string[] = pairs[i].match(/=.+/i) || [];
      if (keyArr[0]) {
        result[decodeURIComponent(keyArr[0])] = decodeURIComponent(
          valueArr[0].substr(1)
        );
      }
    }

    const parameters = {
      key: result.key || "",
      bridge: result.bridge || ""
    };

    return parameters;
  }

  const queryParams: IQueryParamsResult = parseQueryParams(queryString);

  const result: IParseURIResult = {
    protocol,
    ...requiredParams,
    ...queryParams
  };

  return result;
}

export function sanitizeHex(hex: string): string {
  hex = hex.substring(0, 2) === "0x" ? hex.substring(2) : hex;
  if (hex === "") {
    return "";
  }
  hex = hex.length % 2 !== 0 ? "0" + hex : hex;
  return "0x" + hex;
}

export function removeHexPrefix(hex: string): string {
  return hex.toLowerCase().replace("0x", "");
}

export function promisify(
  originalFn: (...args: any[]) => void,
  thisArg?: any
): (
  ...callArgs: any[]
) => Promise<IJsonRpcResponseSuccess | IJsonRpcResponseError> {
  const promisifiedFunction = async (
    ...callArgs: any[]
  ): Promise<IJsonRpcResponseSuccess | IJsonRpcResponseError> => {
    return new Promise((resolve, reject) => {
      const callback = (
        err: Error | null,
        data: IJsonRpcResponseSuccess | IJsonRpcResponseError
      ) => {
        if (err === null || typeof err === "undefined") {
          reject(err);
        }
        resolve(data);
      };
      originalFn.apply(thisArg, [...callArgs, callback]);
    });
  };
  return promisifiedFunction;
}

export function parsePersonalSign(params: string[]): string[] {
  if (!isHexStrict(params[1])) {
    params[1] = convertUtf8ToHex(params[1], true);
  }
  return params;
}

export function parseTransactionData(
  txData: Partial<ITxData>
): Partial<ITxData> {
  if (typeof txData.from === "undefined" || !isValidAddress(txData.from)) {
    throw new Error(`Transaction object must include a valid 'from' value.`);
  }

  function parseHexValues(str: string) {
    if (isHexStrict(str)) {
      return str;
    }
    return convertUtf8ToHex(str);
  }

  const txDataRPC = {
    from: sanitizeHex(txData.from),
    to: typeof txData.to === "undefined" ? "" : sanitizeHex(txData.to),
    gasPrice:
      typeof txData.gasPrice === "undefined"
        ? ""
        : parseHexValues(`${txData.gasPrice}`),
    gasLimit:
      typeof txData.gasLimit === "undefined"
        ? typeof txData.gas === "undefined"
          ? ""
          : parseHexValues(`${txData.gas}`)
        : parseHexValues(`${txData.gasLimit}`),
    value:
      typeof txData.value === "undefined"
        ? ""
        : parseHexValues(`${txData.value}`),
    nonce:
      typeof txData.nonce === "undefined"
        ? ""
        : parseHexValues(`${txData.nonce}`),
    data:
      typeof txData.data === "undefined" ? "" : parseHexValues(`${txData.data}`)
  };

  const prunable = ["gasPrice", "gasLimit", "value", "nonce"];
  Object.keys(txDataRPC).forEach((key: string) => {
    if (!txDataRPC[key].trim().length && prunable.includes(key)) {
      delete txDataRPC[key];
    }
  });

  return txDataRPC;
}

export function formatRpcError(
  error: Partial<IJsonRpcErrorMessage>
): { code: number; message: string } {
  const message = error.message || "Failed or Rejected Request";
  let code: number = -32000;
  if (error && !error.code) {
    switch (message) {
      case "Parse error":
        code = -32700;
        break;
      case "Invalid request":
        code = -32600;
        break;
      case "Method not found":
        code = -32601;
        break;
      case "Invalid params":
        code = -32602;
        break;
      case "Internal error":
        code = -32603;
        break;
      default:
        code = -32000;
        break;
    }
  }
  const result = {
    code,
    message
  };
  return result;
}
