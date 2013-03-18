/*jslint node: true */
"use strict";

var chai = require("chai"),
	DateRange = require("../lib/daterange"),
	expect = chai.expect;


describe("DateRange", function () {
	describe("constructor", function () {
		var dateRange;

		it("should throw an Error if not passed a string", function () {
			expect(function () {
				dateRange = new DateRange([]);
			}).to.throws();

			expect(function () {
				dateRange = new DateRange(1);
			}).to.throws();

			expect(function () {
				dateRange = new DateRange(false);
			}).to.throws();
		});

		it("should throw an Error if passed a string without '~'", function () {
			expect(function () {
				dateRange = new DateRange("");
			}).to.throws();
		});

		it("should throw an Error if passed a string without valid Dates", function () {
			expect(function () {
				dateRange = new DateRange("abcd~efgh");
			}).to.throws();
		});

		it("should throw an Error if passed more than two valid Dates", function () {
			expect(function () {
				dateRange = new DateRange("Thu Jan 01 1970 00:00:00 GMT+0000 (GMT)~Thu Jan 01 1970 00:00:01 GMT+0000 (GMT)~Thu Jan 01 1970 00:00:02 GMT+0000 (GMT)");
			}).to.throws();
		});

		it("should throw an Error if passed a range that does not span at least a day", function () {
			expect(function () {
				dateRange = new DateRange("Thu Jan 01 1970 00:00:00 GMT+0000 (GMT)~Thu Jan 01 1970 00:00:01 GMT+0000 (GMT)");
			}).to.throws();

			expect(function () {
				dateRange = new DateRange("Thu Jan 01 1970 00:00:00 GMT+0000 (GMT)~Thu Jan 01 1970 23:59:59 GMT+0000 (GMT)");
			}).to.throws();
		});

		it("should not throw an Error if passed exactly two Dates at least 24 hours apart", function () {
			expect(function () {
				dateRange = new DateRange("Thu Jan 01 1970 00:00:00 GMT+0000 (GMT)~Fri Jan 02 1970 00:00:00 GMT+0000 (GMT)");
			}).to.not.throws();
		});
	});
});