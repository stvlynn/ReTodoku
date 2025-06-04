// Cloudflare D1 Database TypeScript definitions

declare global {
  interface D1Database {
    prepare(query: string): D1PreparedStatement;
    batch(statements: D1PreparedStatement[]): Promise<D1Result[]>;
    exec(query: string): Promise<D1ExecResult>;
    dump(): Promise<ArrayBuffer>;
  }

  interface D1PreparedStatement {
    bind(...values: any[]): D1PreparedStatement;
    first<T = Record<string, unknown>>(colName?: string): Promise<T | null>;
    run<T = Record<string, unknown>>(): Promise<D1Result<T>>;
    all<T = Record<string, unknown>>(): Promise<D1Result<T[]>>;
    raw<T = unknown[]>(options?: { columnNames?: boolean }): Promise<T[]>;
  }

  interface D1Result<T = Record<string, unknown>> {
    results: T;
    success: boolean;
    meta: {
      served_by: string;
      duration: number;
      changes: number;
      last_row_id: number;
      changed_db: boolean;
      size_after: number;
      rows_read: number;
      rows_written: number;
    };
  }

  interface D1ExecResult {
    count: number;
    duration: number;
  }

  interface Env {
    DB: D1Database;
  }

  interface ExportedHandler<Env = unknown> {
    fetch?(request: Request, env: Env, ctx: ExecutionContext): Response | Promise<Response>;
    scheduled?(event: ScheduledEvent, env: Env, ctx: ExecutionContext): void | Promise<void>;
    queue?(batch: MessageBatch, env: Env, ctx: ExecutionContext): void | Promise<void>;
  }

  interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
  }

  interface ScheduledEvent {
    scheduledTime: number;
    cron: string;
  }

  interface MessageBatch {
    queue: string;
    messages: Message[];
  }

  interface Message {
    id: string;
    timestamp: Date;
    body: any;
  }
}

export {}; 