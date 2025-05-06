import { NextResponse } from 'next/server';

export async function middleware(req) {
    const { pathname } = req.nextUrl;

    // Allow /login and /register to be accessed without authentication
    if (pathname === '/login' || pathname === '/register') {
        return NextResponse.next();
    }

    // Protect the root route "/"
    if (pathname === '/' || pathname.includes("/dashboard")) {
        const token = req.cookies.get('token')?.value;

        try {
            const res = await fetch('http://localhost:8080/api/v1/auth/profile', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token && { 'Authorization': `Bearer ${token}` })
                }
            });

            const data = await res.json();

            if (!data?.success) {
                return NextResponse.redirect(new URL('/login', req.url));
            }
        } catch (err) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/login', '/register'],
};
