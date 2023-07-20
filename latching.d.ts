/*
**  Latching -- Run-Time Hook Latching
**  Copyright (c) 2012-2023 Dr. Ralf S. Engelschall <rse@engelschall.com>
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

export interface LatchingPlugin {
   use(
       latching: Latching,
       options?: any
   ): void
   unuse?(
       latching: Latching
   ): void
}

export default class Latching {
    constructor()
    proc(
        name: string,
        init: (
            this: null,
            valBase?: any
        ) => any,
        step: (
            this: null,
            valOld: any,
            valNew: any
        ) => any
    ): this
    at(
        name: string,
        cb: (this: any, ...args: any[]) => any,
        ctx?: any,
        prepend?: boolean
    ): number
    latch(
        name: string,
        cb: (this: any, ...args: any[]) => any,
        ctx?: any,
        prepend?: boolean
    ): number
    unlatch(
        name: string,
        id: number
    ): this
    hook(
        name: string,
        proc: string,
        ...args: any[]
    ): any
    use(
        plugin: LatchingPlugin,
        options?: any
    ): number
    unuse(
        id: number
    ): this
}

