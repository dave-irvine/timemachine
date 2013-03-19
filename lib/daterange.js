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
	var dateRange = this,
		endDate,
		startDate,
		timestamp;

	if (typeof date === 'string') {
		timestamp = Date.parse(date);
		if (isNaN(timestamp)) {
			throw new Error("Date could not be parsed.");
		}
		date = new Date(timestamp);
	}

	startDate = new Date(dateRange.startRange.getTime());
	endDate = new Date(dateRange.endRange.getTime());

	startDate = DateRange.normaliseDateTime(startDate, { toStart: true });
	endDate = DateRange.normaliseDateTime(endDate, { toEnd: true });

	return ((date.getTime() >= startDate.getTime()) && (date.getTime() <= endDate.getTime()));
};

DateRange.normaliseDateTime = function (date, options) {
	if (options.toStart && !options.toEnd) {
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(1);
	} else if (options.toEnd && !options.toStart) {
		date.setHours(23);
		date.setMinutes(59);
		date.setSeconds(59);
	} else {
		date.setHours(12);
		date.setMinutes(0);
		date.setSeconds(0);
	}

	return date;
};

module.exports = DateRange;
