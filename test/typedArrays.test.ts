import { assertEquals } from "jsr:@std/assert";
import { decode, encode } from "../src/index.ts";

// TODO: make the numbers range for the extent of each number type,
//       also use the easeInOutCubic function to generate the numbers closer to its edges

Deno.test("Uint8Array", () => {
    const value = new Uint8Array(1_000);

    for (let i = 0; i < value.length; i++) {
        value[i] = i;
    }

    const result = decode(encode(value));

    assertEquals(result, value, "Decoding does not match the original value.");
});

Deno.test("Int8Array", () => {
    const value = new Int8Array(1_000);

    for (let i = 0; i < value.length; i++) {
        value[i] = i - 500;
    }

    const result = decode(encode(value));

    assertEquals(result, value, "Decoding does not match the original value.");
});

Deno.test("Uint16Array", () => {
    const value = new Uint16Array(1_000);

    for (let i = 0; i < value.length; i++) {
        value[i] = i;
    }

    const result = decode(encode(value));

    assertEquals(result, value, "Decoding does not match the original value.");
});

Deno.test("Int16Array", () => {
    const value = new Int16Array(1_000);

    for (let i = 0; i < value.length; i++) {
        value[i] = i - 500;
    }

    const result = decode(encode(value));

    assertEquals(result, value, "Decoding does not match the original value.");
});

Deno.test("Uint32Array", () => {
    const value = new Uint32Array(1_000);

    for (let i = 0; i < value.length; i++) {
        value[i] = i;
    }

    const result = decode(encode(value));

    assertEquals(result, value, "Decoding does not match the original value.");
});

Deno.test("Int32Array", () => {
    const value = new Int32Array(1_000);

    for (let i = 0; i < value.length; i++) {
        value[i] = i - 500;
    }

    const result = decode(encode(value));

    assertEquals(result, value, "Decoding does not match the original value.");
});

Deno.test("Float32Array", () => {
    const value = new Float32Array(1_000);

    for (let i = 0; i < value.length; i++) {
        value[i] = i - 500 + Math.random();
    }

    const result = decode(encode(value));

    assertEquals(result, value, "Decoding does not match the original value.");
});

Deno.test("Float64Array", () => {
    const value = new Float64Array(1_000);

    for (let i = 0; i < value.length; i++) {
        value[i] = i - 500 + Math.random();
    }

    const result = decode(encode(value));

    assertEquals(result, value, "Decoding does not match the original value.");
});
