export default function validateCallback(input: any): void{
    if(!input || typeof input !== "function") throw new TypeError('\'callback\' is not function.');
}