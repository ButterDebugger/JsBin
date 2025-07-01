/** The base error class for TruffleByte */
export class JsBinError extends Error {
	constructor() {
		super();

		this.name = "JsBinError";
	}
}

/** Error thrown when a transformer is registered with a tag that has already been registered */
export class TransformerTagTakenError extends JsBinError {
	constructor(tag: number) {
		super();

		this.message = `Transformer for tag '${tag}' already exists.`;
	}
}

/** Error thrown while decoding and a tag without a registered transformer is encountered */
export class UnknownTagError extends JsBinError {
	constructor(tag: number) {
		super();

		this.message = `No transformer found for tag '${tag}'.`;
	}
}

/** Error thrown while decoding a number and an unknown number type identifier is encountered */
export class UnknownNumberTypeError extends JsBinError {
	constructor(tag: number) {
		super();

		this.message = `Unknown number type identifier '${tag}'.`;
	}
}

// export class VersionMismatchError extends JsBinError {
//     constructor(expected: string, actual: string) {
//         super();

//         this.message =
//             `Unknown or unsupported version, expected version "${expected}" but got "${actual}"`;
//     }
// }
