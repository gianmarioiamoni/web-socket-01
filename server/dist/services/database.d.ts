export declare class DatabaseService {
    private static instance;
    private isConnected;
    private constructor();
    static getInstance(): DatabaseService;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getConnectionState(): string;
    isReady(): boolean;
    healthCheck(): Promise<{
        status: string;
        state: string;
    }>;
    setupIndexes(): Promise<void>;
}
export declare const database: DatabaseService;
//# sourceMappingURL=database.d.ts.map