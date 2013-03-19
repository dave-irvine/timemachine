/*jslint node: true */
"use strict";

var DayRange = function DayRange(range) {
	var dayRange = this,
		endDay,
		ranges,
		startDay;

	if (typeof range !== 'string') {
		throw new Error("Expected range as string representation.");
	}

	if (range.indexOf("~") === -1) {
		throw new Error("Expected range as two Day names separated with '~'.");
	}

	ranges = range.split("~");

	if (ranges.length > 2) {
		throw new Error("Expected range as a maximum of two Day names.");
	}

	startDay = ranges[0];
	endDay = ranges[1];

	if (!DayRange.isValidDayName(startDay) || !DayRange.isValidDayName(endDay)) {
		throw new Error("Expected range as two valid Day names.");
	}

	if (DayRange.convertDayNameToNumber(endDay) - DayRange.convertDayNameToNumber(startDay) < 1) {
		throw new Error("Expected range to cover at least one Day.");
	}

	dayRange.startDay = startDay;
	dayRange.endDay = endDay;
};

DayRange.isValidDayName = function (name) {
	if (typeof name !== 'string') {
		return false;
	}

	name = name.toLowerCase();

	return (
		name === "mo" || name === "mon" || name === "monday" ||
		name === "tu" || name === "tue" || name === "tuesday" ||
		name === "we" || name === "wed" || name === "wednesday" ||
		name === "th" || name === "thu" || name === "thursday" ||
		name === "fr" || name === "fri" || name === "friday" ||
		name === "sa" || name === "sat" || name === "saturday" ||
		name === "su" || name === "sun" || name === "sunday"
	);
};

DayRange.convertDayNameToNumber = function (name) {
	if (!DayRange.isValidDayName(name)) {
		return -1;
	}

	name = name.toLowerCase();

	switch (name) {
	case "mo":
	case "mon":
	case "monday":
		return 1;
	case "tu":
	case "tue":
	case "tuesday":
		return 2;
	case "we":
	case "wed":
	case "wednesday":
		return 3;
	case "th":
	case "thu":
	case "thursday":
		return 4;
	case "fr":
	case "fri":
	case "friday":
		return 5;
	case "sa":
	case "sat":
	case "saturday":
		return 6;
	case "su":
	case "sun":
	case "sunday":
		return 7;
	}
};

module.exports = DayRange;
