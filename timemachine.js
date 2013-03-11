#!/usr/bin/env node
var Git = require("./lib/git"),
	path = require("path"),
	clu = require("./lib/clu"),
	Q = require("q"),
	repoPath = "",
	repo = null,
	commits = [],
	commitLinkedList = {},
	options = {
		validCommitTimes: null,
		onlyForAuthor: null,
		onlyCommit: null
	},
	params = [];

process.on('uncaughtException', function (exception) {
	console.log(exception);
});

if (process.argv.length < 4) { throw new Error("TimeMachine :: Not enough options/parameters supplied."); }

clu.convertArgvToOptionsAndParams(process.argv.slice(2), options, params);

if (options.validCommitTimes === null) {
	throw new Error("TimeMachine :: You must specify at least one valid time range to move commits into.");
}

if (options.onlyCommit !== null) {
	if (options.onlyForAuthor !== null) {
		throw new Error("TimeMachine :: --onlyCommit is an exclusive filter and cannot be mixed with others.");
	}
}

options.validCommitTimes = parseCommitTimes(options.validCommitTimes);

repoPath = path.resolve(params[0]);

try {
	repo = new Git(repoPath, false);
} catch(e) {
	throw new Error("TimeMachine :: Couldn't find git repository. Path supplied was: " + params[0]);
}

repo.exec("log", {
	pretty: 'format:"%H%x09%an%x09%ad"'
}).then(function (stdout) {
	parseRepoCommits(stdout);
	filterRepoCommits();
	extractCommitsOutsideTimeRange();
	generateNewTimestampsForCommits();
	applyNewTimestampsForCommits();
}).end();

function parseRepoCommits(stdout) {
	var linkedCommits = [];

	clu.outputIter(stdout, function (line) {
		var commit = line.split("\t");
		commit = new Git.Commit(commit[0], commit[1], commit[2]);
		commits.push(commit);
	});

	for(var c = 0; c < commits.length; c++) {
		var commit = commits[c],
			linkedCommit = {};

		linkedCommit.hash = commit.hash;

		if (c === 0) {
			linkedCommit.next = null;
		} else {
			linkedCommit.next = linkedCommits[linkedCommits.length-1].hash;
		}

		if (c === commits.length-1) {
			linkedCommit.prev = null;
		} else {
			linkedCommit.prev = commits[c+1].hash
		}

		linkedCommits.push(linkedCommit);
		commitLinkedList[linkedCommit.hash] = {
			commit: commit,
			next: linkedCommit.next,
			prev: linkedCommit.prev
		}
	}
}

function applyNewTimestampsForCommits() {
	var sequence = [],
		result;

	commits.forEach(function (commit) {
		sequence.push(function() { return clu.exec(repo.work_dir, "git", ["set-commit-date", commit.hash, '"' + commit.newTimestamp + '"']) });
	});

	if (commits.length > 0) {
		result = Q.resolve(sequence.shift()());

		sequence.forEach(function (f) {
			result = result.then(f);
		});
	} else {
		console.log("No commits out of valid time range. Stop.");
	}
}

function generateNewTimestampsForCommits() {
	var lastNewTimestamp = null,
		rangeCounter = 0;
	// Commits are listed newest first, but we want to work oldest first
	commits.reverse();

	commits.forEach(function (commit) {
		var linkedCommit = commitLinkedList[commit.hash],
			currentRange = options.validCommitTimes[rangeCounter],
			newTimestamp;

		console.log("Commit: " + commit.hash + " is out of range");
		console.log("Commit did have date: " + commit.date);

		if (linkedCommit.prev === null) {
			newTimestamp = new Date(commit.date.getTime());
			newTimestamp.setHours(currentRange.start.getHours());
			newTimestamp.setMinutes(currentRange.start.getMinutes());

			if (newTimestamp.getMinutes() === 0) {
				newTimestamp.setMinutes(1);
			}

			commit.newTimestamp = new Date(newTimestamp.getTime());

			lastNewTimestamp = new Date(newTimestamp.getTime());
		} else {
			var prevCommit = commitLinkedList[linkedCommit.prev];
			// Get offset from previous commit
			var prevCommitDate = prevCommit.commit.date;

			if (!lastNewTimestamp) {
				newTimestamp = new Date(commit.date.getTime());
				newTimestamp.setHours(currentRange.start.getHours());
				newTimestamp.setMinutes(currentRange.start.getMinutes());

				if (newTimestamp.getMinutes() === 0) {
					newTimestamp.setMinutes(1);
				}
			} else {
				if (commit.date.getDate() > lastNewTimestamp.getDate()) {
					rangeCounter = 0;
					currentRange = options.validCommitTimes[rangeCounter];

					newTimestamp = new Date(commit.date.getTime());
					newTimestamp.setHours(currentRange.start.getHours());
					newTimestamp.setMinutes(currentRange.start.getMinutes());
				} else {
					var offsetFromPrev = (commit.date.getTime() - prevCommitDate.getTime());

					//console.log("Commit is offset from last commit by: " + offsetFromPrev);

					newTimestamp = new Date(lastNewTimestamp.getTime() + offsetFromPrev);
				}
			}

			if (!isDateInValidRanges(newTimestamp)) {
				if (rangeCounter < options.validCommitTimes.length - 1) {
					rangeCounter++;
					currentRange = options.validCommitTimes[rangeCounter];

					newTimestamp.setHours(currentRange.start.getHours());
					newTimestamp.setMinutes(currentRange.start.getMinutes());
				} else {
					rangeCounter = 0;
					currentRange = options.validCommitTimes[rangeCounter];
					newTimestamp.setHours(currentRange.start.getHours());
					newTimestamp.setMinutes(currentRange.start.getMinutes());
					//throw new Error("TimeMachine :: Run out of ranges");
				}
			}

			if (newTimestamp.getMinutes() === 0) {
				newTimestamp.setMinutes(1);
			}

			commit.newTimestamp = new Date(newTimestamp.getTime());
			lastNewTimestamp = new Date(newTimestamp.getTime());
		}

		console.log("Commit now has date: " + newTimestamp);
		console.log("");
	});

	// Restore commits to their original order
	commits.reverse();
}

function isDateInValidRanges(date) {
	var dateInRanges = false;

	options.validCommitTimes.forEach(function (range) {
		var rangeStartDate = range.start,
			rangeEndDate = range.end;

		rangeStartDate.setDate(date.getDate());
		rangeStartDate.setMonth(date.getMonth());
		rangeStartDate.setFullYear(date.getFullYear());

		rangeEndDate.setDate(date.getDate());
		rangeEndDate.setMonth(date.getMonth());
		rangeEndDate.setFullYear(date.getFullYear());

		if (date.getTime() >= rangeStartDate.getTime() && date.getTime() <= rangeEndDate.getTime()) {
			dateInRanges = true;
		}
	});

	return dateInRanges;
}

function extractCommitsOutsideTimeRange() {
	var invalidCommits = [];

	commits.forEach(function (commit) {
		var commitInRange = false,
			commitDate = new Date(commit.date.getTime());

		commitDate.setSeconds(0);

		commitInRange = isDateInValidRanges(commitDate);

		if (!commitInRange) {
			invalidCommits.push(commit);
		}
	});

	commits = invalidCommits;
}

function filterRepoCommits() {
	if (options.onlyCommit) {
		commits = filterCommitsWithHash(commits, options.onlyCommit);
		if (commits.length < 1) {
			throw new Error("TimeMachine :: Repo does not contain commit with specified hash: " + options.onlyCommit);
		}
	}

	if (options.onlyForAuthor !== null) {
		commits = filterCommitsWithAuthor(commits, options.onlyForAuthor);
		if (commits.length < 1) {
			throw new Error("TimeMachine :: Repo does not contain any commits by specified author: " + options.onlyForAuthor);
		}
	}
}

function filterCommitsWithHash(commits, hash) {
	var commitsWithHash = [];

	commits.forEach(function (commit) {
		if (commit.hash === hash) {
			commitsWithHash.push(commit);
		}
	});

	if (commitsWithHash.length > 1) {
		throw new Error("TimeMachine :: Repo has several commits with the same hash: " + hash);
	}

	return commitsWithHash;
}

function filterCommitsWithAuthor(commits, author) {
	var commitsWithAuthor = [];

	commits.forEach(function (commit) {
		if (commit.author === author) {
			commitsWithAuthor.push(commit);
		}
	});

	return commitsWithAuthor;
}

function parseCommitTimes(commitTimes) {
	var timeRanges = [],
		rangeRegex = /:/;

	if (!rangeRegex.test(commitTimes)) {
		throw new Error("TimeMachine :: Time range not understood, expecting 'startTime:endTime' (0700:0800) near: " + commitTimes);
	}

	commitTimes = commitTimes.split(",");

	commitTimes.forEach(function (timeRange) {
		var ranges = timeRange.split(":"),
			range = {};

		range.start = new Date();
		range.start.setHours(ranges[0].substr(0, 2));
		range.start.setMinutes(ranges[0].substr(2, 2));
		range.start.setSeconds(0);

		range.end = new Date();
		range.end.setHours(ranges[1].substr(0, 2));
		range.end.setMinutes(ranges[1].substr(2, 2));
		range.end.setSeconds(0);

		if (timeRanges.length === 0) {
			timeRanges.push(range);
		} else {
			if (range.start.getTime() < timeRanges[timeRanges.length-1].start.getTime()) {
				timeRanges.unshift(range);
			} else {
				timeRanges.push(range);
			}
		}
	});

	return timeRanges;
}
