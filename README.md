
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

Installation
------------

#### Node environments (with NPM package manager):

```shell
$ npm install latching
```

#### Browser environments (with Bower package manager):

```shell
$ bower install latching
```

Application Programming Interface (API)
---------------------------------------

- `latching = new Latching()`<br/>
   Create a new latching context. Usually you need just a single
   one per application.

- `class Foo extends Latching { constructor () { super(); ... } ... }`<br/>

- `Foo = function () { Latching.call(this); ... }`<br/>
  `Foo.prototype = Object.create(Latching.prototype)`<br/>
  `Foo.prototype.constructor = Foo`<br/>

- `latching.proc()`<br/>

- `latching.at()`<br/>

  `latching.latch()`

- `latching.unlatch()`<br/>

- `latching.hook()`<br/>

License
-------

Copyright (c) 2012-2015 Ralf S. Engelschall (http://engelschall.com/)

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

