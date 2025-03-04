/**
 * The tags used in the binary format to denote the type of the data
 */
export enum Tags {
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

/**
 * The current version string of the binary format
 */
export const CURRENT_VERSION: string = "2";
