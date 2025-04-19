const transformers: Map<number, Transformer<unknown>> = new Map();

/**
 * A transformer for a specific data type
 */
export type Transformer<In> = {
    isApplicable: (v: unknown) => v is In;
    serialize: (encoder: Encoder, value: In) => void; // | Promise<void>;
    deserialize: (decoder: Decoder) => In;
};

/**
 * The encoder class which transformers use
 */
export class Encoder {
    private size = 0;
    private buffers: Uint8Array[] = [];

    /**
     * Writes a new Uint8Array to the encoder
     */
    write(bytes: Uint8Array): void {
        this.size += bytes.length;
        this.buffers.push(new Uint8Array(bytes));
    }

    /**
     * Chains another transformer to encode a value
     */
    chain<In>(transformer: Transformer<In>, value: In): void {
        transformer.serialize(this, value);
    }

    /**
     * Encodes a value
     */
    serialize(value: unknown): void {
        for (const [tag, transformer] of transformers) {
            if (transformer.isApplicable(value)) {
                this.write(new Uint8Array([tag]));

                transformer.serialize(this, value);
                break;
            }
        }
    }

    /**
     * Merge all the buffers into a single Uint8Array
     */
    merge(): Uint8Array {
        const merged = new Uint8Array(this.size);
        let offset = 0;

        for (const buffer of this.buffers) {
            merged.set(buffer, offset);
            offset += buffer.length;
        }

        return merged;
    }
}

/**
 * The decoder class which transformers use
 */
export class Decoder {
    private cursor = 0;

    constructor(private bytes: Uint8Array) {}

    /**
     * Reads and removes a number of bytes from the content
     * @param length The number of bytes to read
     * @returns The read bytes
     */
    read(length: number): Uint8Array {
        const content = this.bytes.slice(this.cursor, this.cursor + length);
        this.cursor += length;
        return content;
    }

    /**
     * Reads a number of bytes from the content without removing them
     * @param length The number of bytes to read
     * @returns The read bytes
     */
    peek(length: number): Uint8Array {
        return this.bytes.slice(this.cursor, this.cursor + length);
    }

    /**
     * Attempts to decode the content a single time
     * @returns The decoded value
     */
    deserialize(): unknown {
        const tag = this.read(1)[0];
        const transformer = transformers.get(tag);

        if (!transformer) {
            throw new Error(`No transformer found for tag '${tag}'.`);
        }

        return transformer.deserialize(this);
    }

    /**
     * Chain another transformer to decode the content
     * @returns The decoded value from the transformer
     */
    chain<In>(transformer: Transformer<In>): In {
        return transformer.deserialize(this);
    }
}

/**
 * Registers a new transformer
 * @param tag The tag to use for the transformer
 * @param transformer The transformer to register
 * @returns The registered transformer
 */
export function registerTransformer<In>(
    tag: number,
    transformer: Transformer<In>,
): Transformer<In> {
    if (transformers.has(tag)) {
        throw new Error(`Transformer for tag '${tag}' already exists.`);
    }

    transformers.set(tag, transformer as Transformer<unknown>);

    return transformer;
}

/**
 * Encodes the data into a binary format
 * @param value The input data
 * @returns The data serialized into a binary format
 */
export function encode(value: unknown): Uint8Array {
    const encoder = new Encoder();

    // Serialize the value
    encoder.serialize(value);

    // Return the encoded result as an Uint8Array
    return encoder.merge();
}

/**
 * Decodes the encoded input back into data
 * @param bytes The input Uint8Array
 * @returns The deserialized data structure of the binary format
 */
export function decode(bytes: Uint8Array): unknown {
    const decoder = new Decoder(bytes);

    // Return the decoded result
    return decoder.deserialize();
}
