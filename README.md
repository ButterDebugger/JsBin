# JsBin

A simple and lightweight library designed to provide efficient binary
serialization for JavaScript objects. This makes it easy to encode JavaScript
data structures into compact binary formats, saving space and improving
transmission speeds.

## Installation

For Node.js:

```bash
npx jsr add @debutter/jsbin
```

For Deno:

```bash
deno add jsr:@debutter/jsbin
```

For Browsers:

```javascript
import * as JsBin from "https://esm.sh/jsr/@debutter/jsbin@VERSION";
```

## Usage

Example usage for encoding and decoding objects:

```javascript
import { decode, encode } from "@debutter/jsbin";

const data = {
    message: "Hello, world!",
};

// Encode to binary
const encoded = encode(data);

// Decode from binary
const decoded = decode(encoded);

console.log(decoded); // { message: "Hello, world!" }
```

# Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
