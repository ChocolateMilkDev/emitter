import { ListenerData } from "./ListenerData";

export interface Listener {
    listenerData?: ListenerData;
    (...args: any[]): any
}