#!/usr/bin/env node
var Git = require("./lib/git"),
	path = require("path"),
	clu = require("./lib/clu"),
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

function extractCommitsOutsideTimeRange() {
	var invalidCommits = [];

	commits.forEach(function (commit) {
		var commitInRange = false,
			commitDate = new Date(commit.date.getTime());

		commitDate.setSeconds(0);

		options.validCommitTimes.forEach(function (range) {
			var rangeStartDate = range.start,
				rangeEndDate = range.end;

			rangeStartDate.setDate(commitDate.getDate());
			rangeStartDate.setMonth(commitDate.getMonth());
			rangeStartDate.setFullYear(commitDate.getFullYear());

			rangeEndDate.setDate(commitDate.getDate());
			rangeEndDate.setMonth(commitDate.getMonth());
			rangeEndDate.setFullYear(commitDate.getFullYear());

			if (commitDate.getTime() > rangeStartDate.getTime() && commitDate.getTime() < rangeEndDate.getTime()) {
				commitInRange = true;
			}
		});

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
