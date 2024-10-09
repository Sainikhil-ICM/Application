declare global {}

export type ResProps1<T> =
    | { success: true; data?: T; message?: string }
    | { success: false; errors?: any; message?: string };

export type ResData<TData> =
    | { success: true; data: TData; message?: string }
    | { success: false; errors?: any[]; error?: string; message: string };

export type ResResults<TData> =
    | { success: true; results: TData; message?: string }
    | { success: false; errors?: any[]; message: string };
