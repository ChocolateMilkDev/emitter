export default function validateEventName(input: any): void{
    if(!input || typeof input !== "string") throw new TypeError('\'eventName\' is not string.');
}