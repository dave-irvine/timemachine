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

	describe("containsDate()", function () {
		var containsDate,
			dateRange,
			testDate;

		it("should throw an Error if passed an invalid date", function () {
			expect(function () {
				dateRange.containsDate("abcd1234");
			}).to.throws();
		});

		it("should return true if it contains the passed date", function () {
			testDate = new Date("Fri Jan 02 1970 00:00:00 GMT+0000 (GMT)");
			dateRange = new DateRange("Thu Jan 01 1970 00:00:00 GMT+0000 (GMT)~Sat Jan 03 1970 00:00:00 GMT+0000 (GMT)");

			containsDate = dateRange.containsDate(testDate);

			expect(containsDate).to.be.true;
		});

		it("should return false if it does not contain the passed date", function () {
			testDate = new Date("Sun Jan 04 1970 00:00:00 GMT+0000 (GMT)");
			dateRange = new DateRange("Thu Jan 01 1970 00:00:00 GMT+0000 (GMT)~Sat Jan 03 1970 00:00:00 GMT+0000 (GMT)");

			containsDate = dateRange.containsDate(testDate);

			expect(containsDate).to.be.false;
		});
	});

	describe("normaliseDateTime()", function () {
		var normalisedDate,
			testDate = new Date("Fri Jan 02 1970 00:00:00 GMT+0000 (GMT)");

		it("should normalise a Date's time to 00:00:01 if passed 'toStart' as true in options", function () {
			normalisedDate = DateRange.normaliseDateTime(testDate, { toStart: true });

			expect(normalisedDate.getHours()).to.equal(0);
			expect(normalisedDate.getMinutes()).to.equal(0);
			expect(normalisedDate.getSeconds()).to.equal(1);
		});

		it("should normalise a Date's time to 23:59:59 if passed 'toEnd' as true in options", function () {
			normalisedDate = DateRange.normaliseDateTime(testDate, { toEnd: true });

			expect(normalisedDate.getHours()).to.equal(23);
			expect(normalisedDate.getMinutes()).to.equal(59);
			expect(normalisedDate.getSeconds()).to.equal(59);
		});

		it("should normalise a Date's time to 12:00:00 if passed 'toStart' and toEnd' as true in options", function () {
			normalisedDate = DateRange.normaliseDateTime(testDate, { toStart: true, toEnd: true });

			expect(normalisedDate.getHours()).to.equal(12);
			expect(normalisedDate.getMinutes()).to.equal(0);
			expect(normalisedDate.getSeconds()).to.equal(0);
		});
	});
});