import { decode, encode } from "../src/index.ts";
import superjson from "npm:superjson";
import * as cbor from "npm:cbor2";
import { BSON } from "npm:bson";
import * as msgpackr from "npm:msgpackr";

const obj = {
	true_bool: true,
	false_bool: false,
	nil: null,
	empty_object: {},
	empty_array: [],
	nulls: [null, null, null, null, null],
	set_of_values: [1, 2, "blue", "shoe"],
	weird_text: "𝟘𝟙𝟚𝟛",
	pos_integer: 2_943_092,
	neg_integer: -12_043_893,
	pos_float: 8_923.0123,
	neg_float: -3.3333,
	pi_as_float: Math.PI,
	zero: 0,
	array_o_strings_and_other_things: [
		"alrighty 👌",
		"muck 🏳️‍🌈",
		{
			"🐬": [1.00023, true, false, false, true, null]
		},
		"hello, world!",
		{
			"🐬": "🐬",
			"🐳": [
				1.00023,
				2.00053,
				3.00012,
				4.00088,
				5.00021,
				6.00091,
				7.00099,
				8.000101,
				["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l"]
			]
		}
	],
	date: new Date(),
	some_float: 209834823.5,
	some_other_float: 12.0498794,
	neg_bigint: -9857628943.6076,
	pos_bigint: 64971238.78149236,
	long_sentence: "the quick brown fox jumps over the lazy dog".repeat(10),
	a_map: [
		[1, "a"],
		[2, "b"],
		[3, "c"]
	],
	nested_object: {
		a: {
			b: {
				c: {
					d: {
						e: {
							f: {
								g: {
									h: "i"
								}
							}
						}
					}
				}
			}
		}
	}
};

Deno.bench({
	name: "TruffleByte encode",
	group: "Serialization",
	baseline: true,
	fn(): void {
		encode(obj);
	}
});

Deno.bench({
	name: "Superjson stringify",
	group: "Serialization",
	fn(): void {
		superjson.stringify(obj);
	}
});

Deno.bench({
	name: "CBOR encode",
	group: "Serialization",
	fn(): void {
		cbor.encode(obj);
	}
});

Deno.bench({
	name: "BSON serialize",
	group: "Serialization",
	fn(): void {
		BSON.serialize(obj);
	}
});

Deno.bench({
	name: "MsgPack pack",
	group: "Serialization",
	fn(): void {
		msgpackr.pack(obj);
	}
});

Deno.bench({
	name: "JSON stringify",
	group: "Serialization",
	fn(): void {
		JSON.stringify(obj);
	}
});

const encoded = encode(obj);
const stringified = JSON.stringify(obj);
const superStringified = superjson.stringify(obj);
const cborified = cbor.encode(obj);
const bsonified = BSON.serialize(obj);
const msgpackified = msgpackr.pack(obj);

Deno.bench({
	name: "TruffleByte decode",
	group: "Deserialization",
	baseline: true,
	fn(): void {
		decode(encoded);
	}
});

Deno.bench({
	name: "Superjson parse",
	group: "Deserialization",
	fn(): void {
		superjson.parse(superStringified);
	}
});

Deno.bench({
	name: "CBOR decode",
	group: "Deserialization",
	fn(): void {
		cbor.decode(cborified);
	}
});

Deno.bench({
	name: "BSON deserialize",
	group: "Deserialization",
	fn(): void {
		BSON.deserialize(bsonified);
	}
});

Deno.bench({
	name: "MsgPack unpack",
	group: "Deserialization",
	fn(): void {
		msgpackr.unpack(msgpackified);
	}
});

Deno.bench({
	name: "JSON parse",
	group: "Deserialization",
	fn(): void {
		JSON.parse(stringified);
	}
});
