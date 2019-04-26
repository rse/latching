/*
**  Latching -- Run-Time Hook Latching
**  Copyright (c) 2012-2019 Dr. Ralf S. Engelschall <rse@engelschall.com>
**
**  Permission is hereby granted, free of charge, to any person obtaining
**  a copy of this software and associated documentation files (the
**  "Software"), to deal in the Software without restriction, including
**  without limitation the rights to use, copy, modify, merge, publish,
**  distribute, sublicense, and/or sell copies of the Software, and to
**  permit persons to whom the Software is furnished to do so, subject to
**  the following conditions:
**
**  The above copyright notice and this permission notice shall be included
**  in all copies or substantial portions of the Software.
**
**  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
**  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
**  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
**  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
**  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
**  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
**  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/* global describe: false */
/* global it: false */
/* jshint -W030 */
/* jshint unused: false */
/* eslint no-unused-expressions: 0 */

var chai = require("chai")
var expect = chai.expect
chai.config.includeStack = true

var Latching = require("./latching.js")

describe("Latching Library", function () {
    it("API availability", function () {
        var latching = new Latching()
        expect(latching).to.be.a("object")
        expect(latching).to.respondTo("proc")
        expect(latching).to.respondTo("at")
        expect(latching).to.respondTo("latch")
        expect(latching).to.respondTo("unlatch")
        expect(latching).to.respondTo("hook")
    })
    it("base functionality", function () {
        var latching = new Latching()
        expect(latching.hook("access-allowed", "and", "foo", "wrong-secret")).to.be.equal(true)
        expect(latching.hook("access-allowed", "and", "foo", "right-secret")).to.be.equal(true)
        var id = latching.latch("access-allowed", function (user, password, resultPrev, cancel) {
            return password === "right-secret"
        })
        expect(latching.hook("access-allowed", "and", "foo", "wrong-secret")).to.be.equal(false)
        expect(latching.hook("access-allowed", "and", "foo", "right-secret")).to.be.equal(true)
        latching.unlatch("access-allowed", id)
        expect(latching.hook("access-allowed", "and", "foo", "wrong-secret")).to.be.equal(true)
        expect(latching.hook("access-allowed", "and", "foo", "right-secret")).to.be.equal(true)
    })
})

