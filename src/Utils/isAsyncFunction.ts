export default function isAsyncFunction(val: unknown){
    if(typeof val !== "function") return false;

    let valString = String(val)

    let valObjString = Object.prototype.toString.call(val)

    if(valString.includes("__awaiter") && valString.includes("function*")) return true;

    return valObjString === "[object AsyncFunction]"
}