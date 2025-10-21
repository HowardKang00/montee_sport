declare namespace Express {
    export interface AuthRequest extends Request {
        user?: {
            userId: number;
            email: string;
        };
    }
}