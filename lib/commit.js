/*jslint node: true */
"use strict";

var Commit = function (hash, author, date) {
	var commit = this;

	commit.hash = hash;
	commit.author = author;

	try {
		commit.date = new Date(date);
	} catch (e) {
		throw new Error("Commit (" + hash + ") has unparseable date: " + date);
	}
};

Commit.prototype.inDateRanges = function (ranges) {
	var commit = this,
		inRanges;

	inRanges = ranges.filter(function (range) {
		return range.containsDate(commit.date);
	});

	return (inRanges.length > 0);
};

module.exports = Commit;
