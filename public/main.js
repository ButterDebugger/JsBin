import { encode, decode, strictEquals } from "../dist/index.js";

/**
 * Simple assertion that matches the expected value of the result
 */
function assert(result, expected, message = "") {
	const passed = strictEquals(result, expected);

	if (passed) {
		console.log("✅", message);
		return;
	}

	// Log the expected and actual values for easier debugging
	console.log("❌", message, ": Expected", expected, "but got", result);
}

// Perform some tests
const obj = {
	true_bool: true,
	false_bool: false,
	nil: null,
	empty_object: {},
	empty_array: [],
	not_numbers: [Number.NaN, Number.NaN, Number.NaN],
	set_of_values: new Set([1, 2, "blue", "shoe"]),
	weird_text: "𝟘𝟙𝟚𝟛",
	pos_integer: 2_943_092,
	neg_integer: -12_043_893,
	pos_float: 8_923.0123,
	neg_float: -3.3333,
	pi_as_float: Math.PI,
	zero: 0,
	array_o_strings: ["alrighty 👌", "muck 🏳️‍🌈", "hello, world!"],
	date: new Date(),
	pos_inf: Number.POSITIVE_INFINITY,
	neg_inf: Number.NEGATIVE_INFINITY,
	neg_bigint: -98576289436076024356827039840895789654097717023459546709n,
	pos_bigint: 64971238781492366241938768921344678941237638437897348473n,
	zero_bigint: 0n,
	a_map: new Map([
		[1n, "a"],
		[2n, "b"],
		[3n, "c"],
	]),
};

assert(decode(encode(obj)), obj, "Encode and decode");
