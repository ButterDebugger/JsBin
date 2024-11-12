/**
 * Performs a strict type check of a value
 * @param value The input value
 * @returns The strict type of the value
 */
export function strictTypeof(value: unknown): string {
    const type = typeof value;

    switch (type) {
        case "object": {
            if (value === null) return "null";

            const obj = <Record<string, unknown>> value;
            return obj.constructor.name;
        }
        case "number":
            if (Number.isNaN(value)) return "NaN";
            if (value === Number.POSITIVE_INFINITY) return "Infinity";
            if (value === Number.NEGATIVE_INFINITY) return "-Infinity";
            return "Number";
        case "string":
            return "String";
        case "boolean":
            return "Boolean";
        case "function":
            return "Function";
        case "symbol":
            return "Symbol";
        case "bigint":
            return "BigInt";
        default:
            return type;
    }
}

/**
 * Performs a deep comparison between two objects to determine if they are equal
 * @param other1 First input object
 * @param other2 Second input object
 * @returns Whether the two objects are equal
 */
export function strictEquals(other1: unknown, other2: unknown): boolean {
    const strictType1 = strictTypeof(other1);
    const strictType2 = strictTypeof(other2);

    if (strictType1 !== strictType2) return false;

    switch (strictType1) {
        /*
         * Types that require a deeper comparison
         */
        case "Array": {
            const array1 = <Array<unknown>> other1;
            const array2 = <Array<unknown>> other2;

            if (array1.length !== array2.length) return false;

            for (let i = 0; i < array1.length; i++) {
                if (!strictEquals(array1[i], array2[i])) return false;
            }
            break;
        }
        case "Object": {
            const obj1 = <Record<string, unknown>> other1;
            const obj2 = <Record<string, unknown>> other2;

            if (!strictEquals(Object.keys(obj1), Object.keys(obj2))) {
                return false;
            }

            for (const key of Object.keys(obj1)) {
                const value1 = obj1[key];
                const value2 = obj2[key];

                if (!strictEquals(value1, value2)) return false;
            }
            break;
        }
        case "Set": {
            const set1 = <Set<unknown>> other1;
            const set2 = <Set<unknown>> other2;

            if (set1.size !== set2.size) return false;

            const sameSet = set1.intersection(set2);

            if (sameSet.size !== set1.size) return false;
            break;
        }
        case "Map": {
            const map1 = <Map<unknown, unknown>> other1;
            const map2 = <Map<unknown, unknown>> other2;

            if (map1.size !== map2.size) return false;

            for (const key of map1.keys()) {
                const value1 = map1.get(key);
                const value2 = map2.get(key);

                if (!strictEquals(value1, value2)) return false;
            }
            break;
        }
        /*
         * Types that should be equal depending on their value
         */
        case "NaN": {
            if (!(Number.isNaN(other1) && Number.isNaN(other2))) return false;
            break;
        }
        case "Date": {
            const date1 = <Date> other1;
            const date2 = <Date> other2;

            if (date1.getTime() !== date2.getTime()) return false;
            break;
        }
        case "RegExp": {
            const regex1 = <RegExp> other1;
            const regex2 = <RegExp> other2;

            if (regex1.toString() !== regex2.toString()) return false;
            break;
        }
        default: {
            if (other1 !== other2) return false;
            break;
        }
    }

    return true;
}

/*
 * Uint8Array and string conversion methods
 */

/**
 * Converts a Uint8Array or number array into a string
 * @param chars The input array of numbers
 * @returns The decoded string
 */
export function fromUint8Array(chars: Uint8Array | number[]): string {
    const MAX_SAFE_LENGTH = 8192;

    if (chars.length <= MAX_SAFE_LENGTH) {
        return String.fromCharCode.apply(String, <number[]> chars);
    }

    const chunks = [];
    for (let i = 0; i < chars.length; i += MAX_SAFE_LENGTH) {
        const slice = chars.slice(i, i + MAX_SAFE_LENGTH);
        chunks.push(String.fromCharCode.apply(String, <number[]> slice));
    }
    return chunks.join("");
}

/**
 * Converts a string into a Uint8Array
 * @param str The input string
 * @returns The byte representation of the string
 */
export function toUint8Array(str: string): Uint8Array {
    const len = str.length;
    const uint8 = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        uint8[i] = str.charCodeAt(i);
    }
    return uint8;
}
