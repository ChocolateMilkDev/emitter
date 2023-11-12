export interface EmitterOptions{
    limits?: {
        listenerLimit?: number
        warn?: boolean
    }
}
export const DefaultEmitterOptions = {
    limits: {
        listenerLimit: 8,
        warn: true
    }
}