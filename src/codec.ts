import { strictTypeof } from "@debutter/helper";

enum Tags {
    End = 0, // End of Array or Object
    Object = 1, // Record<string, unknown>
    Boolean = 2,
    String = 3,
    Array = 4,
    null = 5,
    BigInt = 6,
    Number = 7, // Integer | Float | NaN | +- Infinity
    Date = 8,
    Set = 9, // Set<unknown>
    Map = 10, // Map<unknown, unknown>
    undefined = 11,
    RegExp = 12,
    URL = 13,
}

const CURRENT_VERSION: string = "1";

/*
 *  Encoding methods
 */

/**
 * Encodes the data into a binary format
 * @param obj The input data
 * @returns The data serialized into a binary format
 */
export function encode(obj: unknown): Uint8Array {
    // Compute the encoded result and prepend the version tag
    const bytes: number[] = [
        ...encodeString(CURRENT_VERSION),
        ...encodeValue(obj),
    ];

    // Return the encoded result as an Uint8Array
    return new Uint8Array(bytes);
}

/**
 * Recursively encodes a item
 */
function encodeValue(item: unknown): number[] {
    switch (strictTypeof(item)) {
        case "Object": {
            const aObj = <Record<string, unknown>> item;

            let bytes = [];
            bytes.push(Tags.Object);

            const keys = Object.keys(aObj);

            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const value = aObj[key];

                if (i % 0xff === 0) {
                    bytes.push(Math.min(keys.length - i, 0xff));
                }

                bytes = bytes.concat(encodeString(key));
                bytes = bytes.concat(encodeValue(value));
            }

            bytes.push(Tags.End);
            return bytes;
        }
        case "Set": {
            const aSet = <Set<unknown>> item;

            let bytes = [];
            bytes.push(Tags.Set);

            const setIter = aSet.values();

            for (let i = 0; i < aSet.size; i++) {
                const value = setIter.next().value;

                if (i % 0xff === 0) {
                    bytes.push(Math.min(aSet.size - i, 0xff));
                }

                bytes = bytes.concat(encodeValue(value));
            }

            bytes.push(Tags.End);
            return bytes;
        }
        case "Map": {
            const aMap = <Map<unknown, unknown>> item;

            let bytes = [];
            bytes.push(Tags.Map);

            const mapIter = aMap.entries();

            for (let i = 0; i < aMap.size; i++) {
                const next = mapIter.next();
                if (next.done) break;

                const [key, value] = next.value;

                if (i % 0xff === 0) {
                    bytes.push(Math.min(aMap.size - i, 0xff));
                }

                bytes = bytes.concat(encodeValue(key));
                bytes = bytes.concat(encodeValue(value));
            }

            bytes.push(Tags.End);
            return bytes;
        }
        case "Array": {
            const aArray = <Array<unknown>> item;

            let bytes = [];
            bytes.push(Tags.Array);

            for (let i = 0; i < aArray.length; i++) {
                const value = aArray[i];

                if (i % 0xff === 0) {
                    bytes.push(Math.min(aArray.length - i, 0xff));
                }

                bytes = bytes.concat(encodeValue(value));
            }

            bytes.push(Tags.End);
            return bytes;
        }
        case "Boolean":
            return [Tags.Boolean, <boolean> item ? 1 : 0];
        case "String":
            return [Tags.String].concat(encodeString(<string> item));
        case "null":
            return [Tags.null];
        case "-Infinity":
        case "Infinity":
        case "NaN":
        case "Number": {
            const aNumber = <number> item;

            return [Tags.Number].concat(encodeNumber(aNumber));
        }
        case "Date": {
            const aDate = <Date> item;

            return [Tags.Date].concat(encodeNumber(aDate.getTime()));
        }
        case "BigInt":
            return [Tags.BigInt].concat(encodeBigInt(<bigint> item));
        case "undefined":
            return [Tags.undefined];
        case "RegExp": {
            const aRegex = <RegExp> item;

            return [Tags.RegExp]
                .concat(encodeString(aRegex.source))
                .concat(encodeString(aRegex.flags));
        }
        case "URL": {
            const aUrl = <URL> item;

            return [Tags.URL].concat(encodeString(aUrl.href));
        }
        default:
            throw new Error("Unsupported data type.");
    }
}

function encodeString(string: string): number[] {
    let data: number[] = [];
    const encoder = new TextEncoder();
    const text = encoder.encode(string);

    data = data.concat(encodeNumber(text.length));
    data = data.concat(Array.from(text));
    return data;
}
function encodeNumber(num: number): number[] {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, num, true);
    const bytes = new Uint8Array(buffer);
    return Array.from(bytes);
}
function encodeBigInt(bigint: bigint): number[] {
    let data = [];

    data.push(bigint < 0 ? 1 : 0);
    let nonNegativeBigint = bigint < 0 ? -bigint : bigint;

    if (nonNegativeBigint === 0n) {
        data.push(0);
        return data;
    }

    const payload = [];
    while (nonNegativeBigint > 0n) {
        payload.unshift(Number(nonNegativeBigint & 255n));
        nonNegativeBigint = nonNegativeBigint / 256n;
    }

    if (payload.length > 255) throw new Error("Unsupported payload length.");

    data.push(payload.length);
    data = data.concat(payload);

    return data;
}

/*
 *  Decoding methods
 */

/**
 * The reader function used by JsBin's decoder
 */
export type Reader = (length: number, slice?: boolean) => number[];

/**
 * Decodes the encoded input back into data
 * @param input The input Uint8Array
 * @returns The deserialized data structure of the binary format
 */
export function decode(input: Uint8Array): unknown {
    const decoding = Array.from(input);

    // Create the reader
    const reader: Reader = (length: number, slice = true) =>
        decoding[slice ? "splice" : "slice"](0, length);

    // Check version tag
    const version = decodeString(reader);
    if (version !== CURRENT_VERSION) {
        throw new Error(
            `Unknown or unsupported version, expected version "${CURRENT_VERSION}" but got "${version}"`,
        );
    }

    // Return decoded result
    return decodeReader(reader);
}

function decodeReader(reader: Reader): unknown {
    // Match the leading tag of the data
    switch (reader(1)[0]) {
        case Tags.Object: {
            const object: Record<string, unknown> = {};
            let itemsLeft = 0;

            while (true) {
                if (itemsLeft === 0) {
                    const extension = reader(1)[0];
                    if (extension === 0) break;

                    itemsLeft += extension;
                }

                const key = decodeString(reader);
                const value = decodeReader(reader);

                object[key] = value;

                itemsLeft--;
            }

            return object;
        }
        case Tags.Boolean: {
            const state = reader(1)[0] === 1;

            return state;
        }
        case Tags.String: {
            return decodeString(reader);
        }
        case Tags.null: {
            return null;
        }
        case Tags.Array: {
            const array = [];
            let itemsLeft = 0;

            while (true) {
                if (itemsLeft === 0) {
                    const extension = reader(1)[0];
                    if (extension === 0) break;

                    itemsLeft += extension;
                }

                const value = decodeReader(reader);

                array.push(value);

                itemsLeft--;
            }

            return array;
        }
        case Tags.Number: {
            return decodeNumber(reader);
        }
        case Tags.Date: {
            const time = decodeNumber(reader);

            return new Date(time);
        }
        case Tags.BigInt: {
            return decodeBigInt(reader);
        }
        case Tags.Set: {
            const set = new Set();
            let itemsLeft = 0;

            while (true) {
                if (itemsLeft === 0) {
                    const extension = reader(1)[0];
                    if (extension === 0) break;

                    itemsLeft += extension;
                }

                const value = decodeReader(reader);

                set.add(value);

                itemsLeft--;
            }

            return set;
        }
        case Tags.Map: {
            const map = new Map();
            let itemsLeft = 0;

            while (true) {
                if (itemsLeft === 0) {
                    const extension = reader(1)[0];
                    if (extension === 0) break;

                    itemsLeft += extension;
                }

                const key = decodeReader(reader);
                const value = decodeReader(reader);

                map.set(key, value);

                itemsLeft--;
            }

            return map;
        }
        case Tags.undefined: {
            return undefined;
        }
        case Tags.RegExp: {
            const source = decodeString(reader);
            const flags = decodeString(reader);

            return new RegExp(source, flags);
        }
        case Tags.URL: {
            const url = decodeString(reader);

            return new URL(url);
        }
        default: {
            throw new Error("Unknown tag.");
        }
    }
}

function decodeString(reader: Reader): string {
    const length = decodeNumber(reader);
    const decoder = new TextDecoder();
    return decoder.decode(new Uint8Array(reader(length)));
}
function decodeNumber(reader: Reader): number {
    const nums = reader(8);
    const buffer = new Uint8Array(nums).buffer;
    const view = new DataView(buffer);
    return view.getFloat64(0, true);
}
function decodeBigInt(reader: Reader): bigint {
    let bigint = 0n;
    const sign = reader(1)[0] === 1;
    const payloadLength = reader(1)[0];

    for (let i = 0; i < payloadLength; i++) {
        bigint += BigInt(reader(1)[0]) * 256n ** BigInt(payloadLength - i - 1);
    }

    bigint = sign ? -bigint : bigint;

    return bigint;
}
