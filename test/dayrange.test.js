/*jslint node: true */
"use strict";

var chai = require("chai"),
	DayRange = require("../lib/dayrange"),
	expect = chai.expect;

describe("DayRange", function () {
	describe("constructor", function () {
		var dayRange;

		it("should throw an Error if not passed a string", function () {
			expect(function () {
				dayRange = new DayRange([]);
			}).to.throws();

			expect(function () {
				dayRange = new DayRange(1);
			}).to.throws();

			expect(function () {
				dayRange = new DayRange(false);
			}).to.throws();
		});

		it("should throw an Error if passed a string without '~'", function () {
			expect(function () {
				dayRange = new DayRange("");
			}).to.throws();
		});

		it("should throw an Error if passed a string without valid Day names", function () {
			expect(function () {
				dayRange = new DayRange("abcd~efgh");
			}).to.throws();
		});

		it("should throw an Error if passed more than two valid Day names", function () {
			expect(function () {
				dayRange = new DayRange("Thu~Fri~Sat");
			}).to.throws();
		});

		it("should throw an Error if passed a range that does not span at least a day", function () {
			expect(function () {
				dayRange = new DayRange("Thu~Thu");
			}).to.throws();
		});

		it("should not throw an Error if passed exactly two Day names at least 1 day apart", function () {
			expect(function () {
				dayRange = new DayRange("Thu~Fri");
			}).to.not.throws();
		});
	});

	describe("isValidDayName", function () {
		it("should return true for 3 variations of 'Monday'", function () {
			expect(DayRange.isValidDayName("Mo")).to.be.true;
			expect(DayRange.isValidDayName("Mon")).to.be.true;
			expect(DayRange.isValidDayName("Monday")).to.be.true;
		});

		it("should return true for 3 variations of 'Tuesday'", function () {
			expect(DayRange.isValidDayName("Tu")).to.be.true;
			expect(DayRange.isValidDayName("Tue")).to.be.true;
			expect(DayRange.isValidDayName("Tuesday")).to.be.true;
		});

		it("should return true for 3 variations of 'Wednesday'", function () {
			expect(DayRange.isValidDayName("We")).to.be.true;
			expect(DayRange.isValidDayName("Wed")).to.be.true;
			expect(DayRange.isValidDayName("Wednesday")).to.be.true;
		});

		it("should return true for 3 variations of 'Thursday'", function () {
			expect(DayRange.isValidDayName("Th")).to.be.true;
			expect(DayRange.isValidDayName("Thu")).to.be.true;
			expect(DayRange.isValidDayName("Thursday")).to.be.true;
		});

		it("should return true for 3 variations of 'Friday'", function () {
			expect(DayRange.isValidDayName("Fr")).to.be.true;
			expect(DayRange.isValidDayName("Fri")).to.be.true;
			expect(DayRange.isValidDayName("Friday")).to.be.true;
		});

		it("should return true for 3 variations of 'Saturday'", function () {
			expect(DayRange.isValidDayName("Sa")).to.be.true;
			expect(DayRange.isValidDayName("Sat")).to.be.true;
			expect(DayRange.isValidDayName("Saturday")).to.be.true;
		});

		it("should return true for 3 variations of 'Sunday'", function () {
			expect(DayRange.isValidDayName("Su")).to.be.true;
			expect(DayRange.isValidDayName("Sun")).to.be.true;
			expect(DayRange.isValidDayName("Sunday")).to.be.true;
		});

		it("should return false for any other value", function () {
			expect(DayRange.isValidDayName("ab")).to.be.false;
			expect(DayRange.isValidDayName(1)).to.be.false;
			expect(DayRange.isValidDayName("m")).to.be.false;
			expect(DayRange.isValidDayName("t")).to.be.false;
			expect(DayRange.isValidDayName(true)).to.be.false;
			expect(DayRange.isValidDayName([])).to.be.false;
			expect(DayRange.isValidDayName({})).to.be.false;
		});
	});

	describe("convertDayNameToNumber()", function () {
		it("should return 1 for 3 variations of 'Monday'", function () {
			expect(DayRange.convertDayNameToNumber("Mo")).to.equal(1);
			expect(DayRange.convertDayNameToNumber("Mon")).to.equal(1);
			expect(DayRange.convertDayNameToNumber("Monday")).to.equal(1);
		});

		it("should return 2 for 3 variations of 'Tuesday'", function () {
			expect(DayRange.convertDayNameToNumber("Tu")).to.equal(2);
			expect(DayRange.convertDayNameToNumber("Tue")).to.equal(2);
			expect(DayRange.convertDayNameToNumber("Tuesday")).to.equal(2);
		});

		it("should return 3 for 3 variations of 'Wednesday'", function () {
			expect(DayRange.convertDayNameToNumber("We")).to.equal(3);
			expect(DayRange.convertDayNameToNumber("Wed")).to.equal(3);
			expect(DayRange.convertDayNameToNumber("Wednesday")).to.equal(3);
		});

		it("should return 4 for 3 variations of 'Thursday'", function () {
			expect(DayRange.convertDayNameToNumber("Th")).to.equal(4);
			expect(DayRange.convertDayNameToNumber("Thu")).to.equal(4);
			expect(DayRange.convertDayNameToNumber("Thursday")).to.equal(4);
		});

		it("should return 5 for 3 variations of 'Friday'", function () {
			expect(DayRange.convertDayNameToNumber("Fr")).to.equal(5);
			expect(DayRange.convertDayNameToNumber("Fri")).to.equal(5);
			expect(DayRange.convertDayNameToNumber("Friday")).to.equal(5);
		});

		it("should return 6 for 3 variations of 'Saturday'", function () {
			expect(DayRange.convertDayNameToNumber("Sa")).to.equal(6);
			expect(DayRange.convertDayNameToNumber("Sat")).to.equal(6);
			expect(DayRange.convertDayNameToNumber("Saturday")).to.equal(6);
		});

		it("should return 7 for 3 variations of 'Sunday'", function () {
			expect(DayRange.convertDayNameToNumber("Su")).to.equal(7);
			expect(DayRange.convertDayNameToNumber("Sun")).to.equal(7);
			expect(DayRange.convertDayNameToNumber("Sunday")).to.equal(7);
		});

		it("should return -1 for any other value", function () {
			expect(DayRange.convertDayNameToNumber("ab")).to.equal(-1);
			expect(DayRange.convertDayNameToNumber(1)).to.equal(-1);
			expect(DayRange.convertDayNameToNumber("m")).to.equal(-1);
			expect(DayRange.convertDayNameToNumber("t")).to.equal(-1);
			expect(DayRange.convertDayNameToNumber(true)).to.equal(-1);
			expect(DayRange.convertDayNameToNumber([])).to.equal(-1);
			expect(DayRange.convertDayNameToNumber({})).to.equal(-1);
		});
	});
});