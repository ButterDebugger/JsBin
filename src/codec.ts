/**
 * The tags used in the binary format to denote the type of the data
 */
export enum Tags {
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
	Uint8Array = 14,
	Int8Array = 15,
	Uint16Array = 16,
	Int16Array = 17,
	Uint32Array = 18,
	Int32Array = 19,
	// Float16Array = 20,
	Float32Array = 21,
	Float64Array = 22
	// ArrayBuffer = 23,
	// DataView = 24,
}
