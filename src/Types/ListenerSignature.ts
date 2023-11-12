import { Listener } from "./Listener";

export type ListenerSignature<S extends any> = {
    [key in keyof S]: Listener
}