export interface DataStore {
    close(): void;
    drop(collection: string): void;
}
