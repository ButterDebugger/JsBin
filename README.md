# TruffleByte

[![JSR](https://jsr.io/badges/@debutter/trufflebyte)](https://jsr.io/@debutter/trufflebyte)
[![JSR Score](https://jsr.io/badges/@debutter/trufflebyte/score)](https://jsr.io/@debutter/trufflebyte)

A simple and lightweight library designed to provide efficient binary
serialization for JavaScript objects. This makes it easy to encode JavaScript
data structures into compact binary formats, saving space and improving
transmission speeds.

## Installation

For Node.js:

```bash
npx jsr add @debutter/trufflebyte
```

For Deno:

```bash
deno add jsr:@debutter/trufflebyte
```

For Browsers:

```javascript
import * as TruffleByte from "https://esm.sh/jsr/@debutter/trufflebyte@VERSION";
```

## Usage

Example usage for encoding and decoding objects:

```javascript
import { decode, encode } from "@debutter/trufflebyte";

const data = {
	message: "Hello, world!"
};

// Encode to binary
const encoded = encode(data);

// Decode from binary
const decoded = decode(encoded);

console.log(decoded); // { message: "Hello, world!" }
```

## Supported Data Types

TruffleByte supports a wide range of JavaScript data types, including:

-   Objects
-   Arrays
-   Strings
-   Numbers
-   BigInts
-   Booleans
-   Null
-   Undefined
-   Dates
-   Sets
-   Maps
-   Regular Expressions
-   URLs

## Extensibility

TruffleByte is designed to be extensible, allowing you to add support for custom data
types. You can do this by creating your own transformers to handle specific data
types.

```javascript
import { registerTransformer } from "@debutter/trufflebyte";

// Define a custom transformer for a specific data type
const MyCustomTransformer = registerTransformer(0, {
	isApplicable: (value) => value instanceof MyCustomType,
	serialize: (encoder, value) => {
		encoder.write(/* Encode the value */);
		// ...
	},
	deserialize: (decoder) => {
		return new MyCustomType(/* Decode the value */);
	}
});
```

Additionally, you can also chain together other transformers to encode and
decode more complex data structures.

```javascript
import { NumberTransformer, registerTransformer } from "@debutter/trufflebyte";

// Define a custom transformer for a specific data type
const Vector2dTransformer = registerTransformer(0, {
	isApplicable: (value) => value instanceof Vector2d,
	serialize: (encoder, vector) => {
		encoder.chain(NumberTransformer, vector.x);
		encoder.chain(NumberTransformer, vector.y);
	},
	deserialize: (decoder) => {
		const x = decoder.chain(NumberTransformer);
		const y = decoder.chain(NumberTransformer);

		return new Vector2d(x, y);
	}
});
```

Note that custom transformer tags ranging from 0 to 127 are reserved by this
library and are subject to being taken.

# Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
