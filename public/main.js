import { add } from "../dist/index.js";

/**
 * Simple assertion that matches the expected value of the result
 */
function assert(result, expected, message = "") {
	const passed = result === expected;

	if (passed) {
		console.log("✅", message);
		return;
	}

	// Log the expected and actual values for easier debugging
	console.log("❌", message, ": Expected", expected, "but got", result);
}

// Perform some tests
assert(add(1, 2), 3, "Sum of 1 and 2");
