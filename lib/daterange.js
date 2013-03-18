/*jslint node: true */
"use strict";

var DateRange = function DateRange(range) {
	var ranges,
		startTimestamp,
		endTimestamp,
		dateRange = this;

	if (typeof range !== 'string') {
		throw new Error("Expected range as string representation.");
	}

	if (range.indexOf("~") === -1) {
		throw new Error("Expected range as two Date formats separated with '~'.");
	}

	ranges = range.split("~");

	if (ranges.length > 2) {
		throw new Error("Expected range as a maximum of two Date formats.");
	}
	
	startTimestamp = Date.parse(ranges[0]);
	endTimestamp = Date.parse(ranges[1]);

	if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
		throw new Error("Expected range as two valid Date formats.");
	}

	if (endTimestamp - startTimestamp < 86400000) {
		throw new Error("Expected range to be at least 1 day.");
	}

	dateRange.startRange = new Date(startTimestamp);
	dateRange.endRange = new Date(endTimestamp);
};

DateRange.prototype.containsDate = function (date) {

};

module.exports = DateRange;