/*jslint node: true */
"use strict";

var chai = require("chai"),
	Commit = require("../lib/commit"),
	expect = chai.expect;

describe("Commit", function () {
	describe("constructor", function () {
		var commit;

		it("should throw an Error if not passed a hash", function () {
			expect(function () {
				commit = new Commit("", "Test Author", "Thu Jan 01 1970 00:00:00 GMT+0000 (GMT)");
			}).to.throws();
		});

		it("should throw an Error if not passed an author", function () {
			expect(function () {
				commit = new Commit("abcd1234", "", "Thu Jan 01 1970 00:00:00 GMT+0000 (GMT)");
			}).to.throws();
		});

		it("should throw an Error if passed an invalid date", function () {
			expect(function () {
				commit = new Commit("abcd1234", "Test Author", "");
			}).to.throws();
		});
	});
});
