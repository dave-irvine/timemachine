/*jslint node: true */
"use strict";

var chai = require("chai"),
	sinonChai = require("sinon-chai"),
	Git = require("../lib/git"),
	expect = chai.expect,
	sinon = require("sinon"),
	Q = require("q");

chai.use(sinonChai);

describe("Git", function () {
	describe("constructor", function () {
		it("should throw an Error if not given a path", function () {
			expect(function () {
				var repo = new Git();
			}).to.throws();
		});

		it("should throw an Error if not given an expected type", function () {
			expect(function () {
				var repo = new Git([]);
			}).to.throws();
		});

		it("should throw an Error if not given a path to a repository", function () {
			expect(function () {
				var repo = new Git("/tmp");
			}).to.throws();
		});

		it("should throw an Error if given a valid repository but also specified bare", function () {
			expect(function () {
				var repo = new Git("test/testbed/fixtures/simple", true);
			}).to.throws();
		});

		it("should throw an Error if given a bare repository but specified not bare", function () {
			expect(function () {
				var repo = new Git("test/testbed/fixtures/bare", false);
			}).to.throws();
		});

		it("should not throw an Error if given a valid non-bare repository", function () {
			expect(function () {
				var repo = new Git("test/testbed/fixtures/simple");
			}).to.not.throws();
		});

		it("should not throw an Error if given a valid bare repository and specified bare", function () {
			expect(function () {
				var repo = new Git("test/testbed/fixtures/bare", true);
			}).to.not.throws();
		});
	});
});
