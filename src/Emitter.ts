import { ListenerMap } from "./Types/ListenerMap";
import { ListenerSignature } from "./Types/ListenerSignature";
import { DefaultEmitterOptions, EmitterOptions } from "./Types/EmitterOptions";
import { ListenerData } from "./Types/ListenerData";
import validateCallback from "./Utils/validateCallback";
import validateEventName from "./Utils/validateEventName";



export default class ChocolateMilkEmitter<L extends ListenerSignature<L> = ListenerMap>{
    public listeners: Map<keyof L, Array<L[keyof L]>> = new Map<keyof L, Array<L[keyof L]>>();
    public emitteds: Map<keyof L, boolean> = new Map<keyof L, boolean>();
    public warned: boolean = false;
    protected emitterOptions: EmitterOptions;
    constructor(emitterOptions?: EmitterOptions){
        this.emitterOptions = ChocolateMilkEmitter.applyOptions(emitterOptions)
    }
    on<K extends keyof L>(eventName: K, callback: L[K]): this {
        validateEventName(eventName);
        validateCallback(callback);
        callback.listenerData = {
            once: false,
            suspended: false
        }
        this.listeners.has(eventName) ? this.listeners.get(eventName)?.push(callback) : this.listeners.set(eventName, [callback])
        let events = this.listeners.get(eventName)
            if((events.length > this.emitterOptions.limits.listenerLimit) && this.emitterOptions.limits.warn && !this.warned) {
                this.warned = true;
                process.emitWarning(`listener limit is ${this.emitterOptions.limits.listenerLimit}, but this events listener size is bigger than listener limit, but you can change this in emitterOptions`) 
            }
        return this;
    }
    once<K extends keyof L>(eventName: K, callback: L[K]): this {
        validateEventName(eventName);
        validateCallback(callback);
        callback.listenerData = {
            once: true,
            suspended: false
        }
        this.listeners.has(eventName) ? this.listeners.get(eventName)?.push(callback) : this.listeners.set(eventName, [callback])
        let events = this.listeners.get(eventName)
            if((events.length > this.emitterOptions.limits.listenerLimit) && this.emitterOptions.limits.warn && !this.warned) {
                this.warned = true;
                process.emitWarning(`listener limit is ${this.emitterOptions.limits.listenerLimit}, but this events listener size is bigger than listener limit, but you can change this in emitterOptions`) 
            }

        return this;
    }
    onceAsync<K extends keyof L>(eventName: K): Promise<Parameters<L[K]>>{
        let promise = new Promise<Parameters<L[K]>>((resolve, reject) => {
            //@ts-ignore
            this.once(eventName, (...parameters: Parameters<L[K]>) => {
                try {
                    resolve(parameters)
                } catch(e){
                    reject(e)
                }
            })
        })

        return promise
    }
    off<K extends keyof L>(eventName: K, callback?: L[K]): this {
        validateEventName(eventName);
        validateCallback(callback);
        if(!callback && this.listeners.has(eventName)) this.listeners.set(eventName, [])
        if(callback && this.listeners.has(eventName)) this.listeners.set(eventName, this.listeners.get(eventName).filter((v) => v !== callback));

        return this;
    }
    emit<K extends keyof L>(eventName: K, ...parameters: Parameters<L[K]>): ReturnType<L[K]> {
        validateEventName(eventName);
        if(this.listeners.has(eventName) && this.listeners.get(eventName).length > 0) {
        let events = this.listeners.get(eventName)
        for(const callback of events){
                if(callback.listenerData.suspended) return;
                if(callback.listenerData.once) this.off(eventName, callback)

                let callbackRes = callback(...parameters);

                if(callbackRes instanceof Promise) callbackRes.then((v) => callback.listenerData["listened"] = true)
                if(!this.emitteds.has(eventName)) this.emitteds.set(eventName, true)
                else callback.listenerData["listened"] = true

                return callbackRes
            }
        }
    }
    hasListener<K extends keyof L>(eventName: K, callback?: L[K]): boolean {
        validateEventName(eventName);
        validateCallback(callback);
        if(!this.listeners.has(eventName)) return false;
        let events = this.listeners.get(eventName)
        if(!callback) return this.listeners.has(eventName)
        else return events.some((listener) => String(listener) === String(callback))
    }
    isListened<K extends keyof L>(eventName: K): boolean {
        validateEventName(eventName);
        if(!this.listeners.has(eventName)) return false;
        let events = this.listeners.get(eventName)
        return events.some((listener) => listener.listenerData.listened)
    }
    isEmitted<K extends keyof L>(eventName: K): boolean {
        validateEventName(eventName);
        if(!this.listeners.has(eventName)) return false;
        return this.emitteds.has(eventName)
    }
    suspendListener<K extends keyof L>(eventName: K, callback?: L[K]): void {
        validateEventName(eventName);
        if (callback && typeof callback !== 'function') throw new TypeError('\'callback\' is not function.');
        let events = this.listeners.get(eventName)
        if(!callback){
            for(const listener of events){
                listener.listenerData.suspended = true;
            }
        } else {
            let listener = events.find((v) => String(v) === String(callback))
            listener.listenerData.suspended = true;
        }
        return void 0;
    }
    unsuspendListener<K extends keyof L>(eventName: K, callback?: L[K]): void {
        validateEventName(eventName);
        if (callback && typeof callback !== 'function') throw new TypeError('\'callback\' is not function.');
        let events = this.listeners.get(eventName)
        if(!callback){
            for(const listener of events){
                listener.listenerData.suspended = false;
            }
        } else {
            let listener = events.find((v) => String(v) === String(callback))
            listener.listenerData.suspended = false;
        }
        return void 0;
    }
    isSuspended<K extends keyof L>(eventName: K, callback?: L[K]): boolean {
        validateEventName(eventName);
        if (callback && typeof callback !== 'function') throw new TypeError('\'callback\' is not function.');
        let events = this.listeners.get(eventName)
        if(!callback) events.some((v) => v.listenerData.suspended)
        else return events.find((v) => String(v) === String(callback)).listenerData.suspended
    }
    modifyListenerData<K extends keyof L>(eventName: K, callback: L[K], listenerData: ListenerData): this{
        validateEventName(eventName);
        validateCallback(callback);
        let listener = this.listeners.get(eventName).find((v) => String(v) === String(callback))
        listener.listenerData = listenerData
        this.listeners.set(eventName, this.listeners.get(eventName).filter((v) => v !== callback))
        return this;
    }
    static applyOptions(emitterOptions?: EmitterOptions): EmitterOptions{
        if(!emitterOptions) emitterOptions = DefaultEmitterOptions
        if(!emitterOptions?.limits) emitterOptions.limits = {
            listenerLimit: 8,
            warn: true
        }
        if(emitterOptions.limits.warn === undefined) emitterOptions.limits.warn = true
        if(!emitterOptions.limits.listenerLimit) emitterOptions.limits.listenerLimit = 8
        if(!emitterOptions) emitterOptions = DefaultEmitterOptions

        return emitterOptions
    }
}