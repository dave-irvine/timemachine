#!/usr/bin/env node
var Git = require("./lib/git"),
	path = require("path"),
	clu = require("./lib/clu"),
	repoPath = "",
	repo = null,
	commits = [],
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
}).end();

function parseRepoCommits(stdout) {
	clu.outputIter(stdout, function (line) {
		var commit = line.split("\t");
		commit = new Git.Commit(commit[0], commit[1], commit[2]);
		commits.push(commit);
	});

	if (options.onlyCommit) {
		commits = filterCommitsWithHash(commits, options.onlyCommit);
		if (commits.length < 1) {
			throw new Error("TimeMachine :: Repo does not contain commit with specified hash: " + options.onlyCommit);
		}
	}

	if (options.onlyForAuthor !== null) {
		filterCommitsWithAuthor(commits, options.onlyForAuthor);
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

		timeRanges.push(range);
	});

	return timeRanges;
}
