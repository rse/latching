
Latching
========

Run-Time Hook Latching

<p/>
<img src="https://nodei.co/npm/latching.png?downloads=true&stars=true" alt=""/>

<p/>
<img src="https://david-dm.org/rse/latching.png" alt=""/>

About
-----

*Latching* is a small JavaScript library for use in Node and Browser
environments, providing a small run-time hook latching facility,
allowing your program to be extended by plugins which latch into
provided run-time hooks.

Example
-------

Assume you have an application which, at some point in time, has to
check whether an user is allowed access. The default is to allow access,
but once a plugin is loaded it can provide a more fine-grained access
control.

- `app.js`:

    ```js
    class App extends Latching {
        constructor () {
            super()
            ...
        }
        main () {
            let options = [
                { names: [ "version", "v" ], type: "bool", "default": false,
                  help: "Print tool version and exit." },
                { names: [ "help", "h" ], type: "bool", "default": false,
                  help: "Print this help and exit." },
                ...
            ]
            this.hook("cli-options", "none", options)
            let parser = dashdash.createParser({
                options: options,
            })
            ...
        }
        log (level, msg) {
            msg = this.hook("log-message", "pass", msg)
            logger.log(level, msg)
        }
        login (username, password) {
            ...
            if (!this.hook("access-allowed", "and", username, password))
                throw new Error("access not allowed")
            ...
        }
        ...
    }
    app = new App()
    ...
    ```

- `plugin-foo.js`:

    ```js
    /*  extend applications CLI option parsing  */
    app.latch("cli-options", (options) => {
        options.push({
            names: [ "foo", "f" ], type: "bool", "default": false,
            help: "Enable the Foo feature"
        })
    })
    ```

- `plugin-geoip.js`:

    ```js
    /*  extend applications logging with client location  */
    app.latch("log-message", (msg) => {
        let location = ...
        return `${msg}, location=${location}`
    })
    ```

- `plugin-auth.js`

    ```js
    /*  extend application authentication strategy with a database variant  */
    app.latch("access-allowed", (username, password) => {
        return db.user.findById(username).sha1 === sha1(password)
    })
    ```

Installation
------------

```shell
$ npm install latching
```

Application Programming Interface (API)
---------------------------------------

- `Latching`<br/>
   The exported latching context API class.

    **Example**:

    ```js
    var latching = new Latching()
    ```

    This creates a new latching context. Usually you need just a
    single one per application. The latching context has to be provided
    to all plugins. This is the usual approach for applications using *Latching*.

    ```js
    class Foo extends Latching {
        constructor () {
            super()
            ...
        }
        ...
    }
    ```

    This defines a class as a latching context by inheriting from it.
    This is the usual approach for libraries using *Latching*.
    This is the more elegant ECMAScript 6 syntax.

    ```js
    var Foo = function () {
        Latching.call(this)
        ...
    }
    Foo.prototype = Object.create(Latching.prototype)
    Foo.prototype.constructor = Foo
    ```

    This defines a class as a latching context by inheriting from it.
    This is the usual approach for libraries using *Latching*.
    This is the less elegant ECMAScript 5 syntax.

- `Latching#proc(proc: string, init: (params: any[]) => any step: (prevResult: any, nextResult: any) => any): Latching`<br/>
   Define a custom result processing strategy under name `proc`, based on an
   initial value produced by `init` (which optionally can be derived
   from the `hook` parameters `params`) and a zero or multiple times
   applied result processing `step`.

    **Example** (also the default):

    ```js
    latching.proc("none",   function ( ) { return undefined }, function (    ) { })
    latching.proc("pass",   function (p) { return p[0] },      function (o, n) { return n })
    latching.proc("or",     function ( ) { return false },     function (o, n) { return o || n })
    latching.proc("and",    function ( ) { return true },      function (o, n) { return o && n })
    latching.proc("mult",   function ( ) { return 1 },         function (o, n) { return o * n })
    latching.proc("add",    function ( ) { return 0 },         function (o, n) { return o + n })
    latching.proc("append", function ( ) { return "" },        function (o, n) { return o + n })
    latching.proc("push",   function ( ) { return [] },        function (o, n) { o.push(n); return o })
    latching.proc("concat", function ( ) { return [] },        function (o, n) { return o.concat(n) })
    latching.proc("insert", function ( ) { return {} },        function (o, n) { o[n] = true; return o })
    latching.proc("assign", function ( ) { return {} },        function (o, n) { Object.keys(n).forEach(function (k) { o[k] = n[k] }) } )
    ```

- `Latching#{at,latch}(name: string, cb: (...params: any, prevResult: any, cancel: () => void) => any, ctx: object, prepend: boolean): number`<br/>
  Latch into a hook of name `name` with the help of a callback function
  `cb` and optionally its context `ctx` and optionally by prepending
  (instead of appending, the default) this latching in the processing
  order. The method `at` is just a short alias for the canonical `latch`.

    **Example**:

    ```js
    let id = latching.latch("access-allowed", (user, password, resultPrev, cancel) => {
        return db.user.findById(user).sha1 === sha1(password)
    })
    ```

- `Latching#unlatch(name: string, id: number): Latching`<br/>
  Unlatch, from the hook of name `name`, the callback function with `id`.

    **Example**:

    ```js
    latching.unlatch("access-allowed", id)
    ```

- `Latching#hook(name: string, proc: name, ...params: any): any`<br/>
  Execute the hook of name `name` with the processing strategy `proc`.
  This calls all previously latched callbacks with the n+2 (n >= 0)
  parameters `...params: any, resultPrev: any, cancel: () => void`.

    **Example**:

    ```js
    let allowed = latching.hook("access-allowed", "and", user, password)
    ```

- `Latching#use(plugin: (function|class|object), options: object = {}): number`<br/>
  First, if `plugin` is a function or class, this instanciates it with
  `new`. Second, this attaches the plugin to the Latching. Third, this
  calls the method `plugin#use(latching: Latching, options: object)`
  on the plugin itself to give the plugin a chance to react after it
  was attached to the latching. The `Latching#use()` returns a unique
  identifier for use by `Latching#unuse()`.

    **Example**:

    ```js
    class Plugin {
        use (latching, options) {
            this.id = latching.latch("access-allowed", (user, password, resultPrev, cancel) => {
                return db.user.findById(user).sha1 === sha1(password)
            })
        }
        unuse (latching) {
            latching.unlatch("access-allowed", this.id)
        }
    }
    [...]
    latching.use(Plugin)
    ```

- `Latching#unuse(id: number): Latching`<br/>
  First, this optionally calls the method `plugin#unuse(latching:
  Latching)` on the plugin to give the plugin a chance to react before
  it detached from the latching. Second, it detaches the plugin from the
  latching.

History
-------

The latching functionality was first introduced 2012 in [ComponentJS](http://componentjs.com)
and then revised 2015 for [Microkernel](http://github.com/rse/microkernel/). It then
was factored out 2015 into this separate **Latching** library as the functionality
is useful to have at hand in other applications and libraries through a simple
dependency only.

License
-------

Copyright (c) 2012-2019 Dr. Ralf S. Engelschall (http://engelschall.com/)

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
"Software"), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be included
in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

