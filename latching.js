/*
**  Latching -- Run-Time Hook Latching
**  Copyright (c) 2012-2017 Ralf S. Engelschall <rse@engelschall.com>
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

/*  the API class  */
var Latching = function () {
    this._reg  = {}
    this._cnt  = 0
    this._proc = {}

    /*  pre-define some essential result processings  */
    this.proc("none",   function ( ) { return undefined }, function (    ) { })
    this.proc("pass",   function (p) { return p[0] },      function (o, n) { return n })
    this.proc("or",     function ( ) { return false },     function (o, n) { return o || n })
    this.proc("and",    function ( ) { return true },      function (o, n) { return o && n })
    this.proc("mult",   function ( ) { return 1 },         function (o, n) { return o * n })
    this.proc("add",    function ( ) { return 0 },         function (o, n) { return o + n })
    this.proc("append", function ( ) { return "" },        function (o, n) { return o + n })
    this.proc("push",   function ( ) { return [] },        function (o, n) { o.push(n); return o })
    this.proc("concat", function ( ) { return [] },        function (o, n) { return o.concat(n) })
    this.proc("insert", function ( ) { return {} },        function (o, n) { o[n] = true; return o })
    this.proc("assign", function ( ) { return {} },        function (o, n) { Object.keys(n).forEach(function (k) { o[k] = n[k] }) } )
}
Latching.prototype = {
    /*  define custom result processor  */
    proc: function (name, init, step) {
        /*  sanity check arguments  */
        if (arguments.length !== 3)
            throw new Error("proc: invalid number of arguments")
        if (typeof name !== "string")
            throw new Error("proc: invalid name argument (has to be string)")
        if (typeof init !== "function")
            throw new Error("proc: invalid init argument (has to be function)")
        if (typeof step !== "function")
            throw new Error("proc: invalid step argument (has to be function)")
        this._proc[name] = { init: init, step: step }
        return this
    },

    /*  latch into hook (convenience alias)  */
    at: function () {
        return this.latch.apply(this, arguments)
    },

    /*  latch into hook  */
    latch: function (name, cb, ctx, prepend) {
        /*  sanity check arguments  */
        if (arguments.length < 2 || arguments.length > 4)
            throw new Error("latch: invalid number of arguments")

        /*  on-the-fly create hook callback registry slot  */
        if (this._reg[name] === undefined)
            this._reg[name] = []

        /*  store callback into hook callback registry slot  */
        var id = this._cnt++
        var rec = { id: id, cb: cb, ctx: ctx }
        if (prepend)
            this._reg[name].unshift(rec)
        else
            this._reg[name].push(rec)
        return id
    },

    /*  unlatch from hook  */
    unlatch: function (name, id) {
        /*  sanity check arguments  */
        if (arguments.length !== 2)
            throw new Error("unlatch: invalid number of arguments")
        if (this._reg[name] === undefined)
            throw new Error("unlatch: no such hook \"" + name + "\"")

        /*  search for callback in hook callback registry slot  */
        var k = -1
        for (var i = 0; i < this._reg[name].length; i++) {
            if (this._reg[name][i].id === id) {
                k = i
                break
            }
        }
        if (k === -1)
            throw new Error("unlatch: no such latched callback")

        /*  remove callback from hook callback registry slot  */
        this._reg[name].splice(k, 1)

        return this
    },

    /*  provide hook  */
    hook: function (name, proc) {
        /*  sanity check arguments  */
        if (arguments.length < 2)
            throw new Error("hook: invalid number of arguments")
        if (this._proc[proc] === undefined)
            throw new Error("hook: no such result processing defined")
        var params = Array.prototype.slice.call(arguments, 2)

        /*  start result with the initial value  */
        var result = this._proc[proc].init.call(null, params)

        /*  give all registered callbacks a chance to
            execute and modify the current result  */
        if (this._reg[name] !== undefined) {
            for (var i = 0; i < this._reg[name].length; i++) {
                var latched = this._reg[name][i]

                /*  support cancellation  */
                var cancelled = false
                var cancel = function () { cancelled = true }

                /*  call latched callback  */
                var resultNew = latched.cb.apply(latched.ctx, params.concat([ result, cancel ]))

                /*  process/merge results  */
                result = this._proc[proc].step.call(null, result, resultNew)

                /*  optionally cancel/short-circuit processing  */
                if (cancelled)
                    break
            }
        }

        /*  return the final result  */
        return result
    }
}

/*  export the API class  */
module.exports = Latching

