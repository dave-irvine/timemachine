/*jslint node: true */
"use strict";

var Commit = function (hash, author, date) {
	var commit = this,
		commitTimestamp;

	if (!hash || hash === "") {
		throw new Error("Commit must have a hash.");
	}

	commit.hash = hash;

	if (!author || author === "") {
		throw new Error("Commit (" + hash + ") must have an author.");
	}

	commit.author = author;

	commitTimestamp = Date.parse(date);

	if (isNaN(commitTimestamp)) {
		throw new Error("Commit (" + hash + ") has unparseable date: " + date);
	}

	commit.date = new Date(commitTimestamp);
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
