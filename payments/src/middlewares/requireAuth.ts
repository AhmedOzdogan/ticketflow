import axios, { AxiosError } from 'axios';

import type {
    NextFunction,
    Request,
    Response,
} from 'express';

import type { AuthUser } from '../types/AuthUser.js';

type UserRole = 'buyer' | 'organizer' | 'admin';

declare global {
    namespace Express {
        interface Request {
            user: AuthUser;
        }
    }
}

export function requireAuth(allowedRoles?: UserRole[]) {
    return async function authMiddleware(
        req: Request,
        res: Response,
        next: NextFunction,
    ) {
        const accessToken = req.headers.authorization;

        if (!accessToken?.startsWith('Bearer ')) {
            return res.status(401).json({
                message: 'Authentication required.',
            });
        }

        try {
            const response = await axios.get<AuthUser>(
                `${process.env.DJANGO_API}/users/me`,
                {
                    headers: {
                        Authorization: accessToken,
                    },
                },
            );

            req.user = {
                id: response.data.id,
                email: response.data.email,
                role: response.data.role,
                is_email_verified: response.data.is_email_verified

            };

            if (
                allowedRoles &&
                !allowedRoles.includes(req.user.role)
            ) {
                return res.status(403).json({
                    message:
                        'You are not authorized to access this resource.',
                });
            }
            if (!req.user.is_email_verified) {

                return res.status(403).json({
                    message:
                        'Your email is not verified to do this action.',
                });
            }

            return next();
        } catch (error) {
            console.log(error)
            if (error instanceof AxiosError && error.response) {
                return res.status(401).json({
                    message: 'Invalid or expired token.',
                });
            }

            return res.status(503).json({
                message:
                    'Authentication service is unavailable.',
            });
        }
    };
}