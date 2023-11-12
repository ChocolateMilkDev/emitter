# @chocolatemilkdev/emitter

a basic event emitter.

![Image](https://img.shields.io/npm/dt/@chocolatemilkdev/emitter.svg?color=%2351FC0&maxAge=3600)
![Image](https://img.shields.io/npm/v/@chocolatemilkdev/emitter?color=red&label=djs-extended-collectors)

### Features

- Builded on ESM, CJS and UMD.
- Type-Safe.
- Optimized.
- Basic Usage.

#### Note:

- ES6/ES2015 or newer required.

## Usage

```js
import ChocolateMilkEmitter from "@chocolatemilkdev/emitter";//ESM and TS
/**
 * const ChocolateMilkEmitter = require("@chocolatemilkdev/emitter").default
*/
const emitter = new ChocolateMilkEmitter()

emitter.on("a", (number) => {
    console.log(number)
})

emitter.emit("a", 1)

emitter.hasListener("a", (number) => {
    console.log(number)
})//true
emitter.isEmitted("a")//true
```

### Note: Typing Events
```ts
interface MyEvents{
    eat: (food: string) => any;
    drink: (drink: string) => string;
}

const emitter = new ChocolateMilkEmitter<MyEvents>()

emitter.on("eat", (food) => {
    console.log(food)
})
emitter.on("drink", (drink) => {
    return "a"
})

emitter.emit("eat", "kebap")//undefined
emitter.emit("drink", "water")//"a"
```

## Contact/Support

<a href="https://discord.com/users/586995957695119477">Discord</a>