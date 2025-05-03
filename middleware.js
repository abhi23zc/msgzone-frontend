import { NextResponse } from 'next/server';

export async function middleware(req) {
    
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

        if (!data?.success && req.nextUrl.pathname.startsWith('/home')) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    } catch (err) {
        if (req.nextUrl.pathname.startsWith('/home')) {
            return NextResponse.redirect(new URL('/login', req.url));
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/home/:path*'],
};
