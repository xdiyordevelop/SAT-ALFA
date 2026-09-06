import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SESSION_COOKIE = "sat_alfa_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "dev-secret-change-in-production";
const secretKey = new TextEncoder().encode(SESSION_SECRET);

export async function proxy(request: NextRequest) {
 const { pathname } = request.nextUrl
 
 const isAuthRoute = pathname.startsWith('/login')
 const isAdminRoute = pathname.startsWith('/admin')
 const isStudentRoute = pathname.startsWith('/student')

 if (!isAdminRoute && !isStudentRoute) {
 return NextResponse.next()
 }

 const sessionCookie = request.cookies.get(SESSION_COOKIE)

 if (!sessionCookie?.value) {
 return NextResponse.redirect(new URL('/login', request.url))
 }

 try {
    const { payload } = await jwtVerify(sessionCookie.value, secretKey)
    const role = payload.role as string

    const isStaff = role === 'SUPER_ADMIN' || role === 'ADMIN' || role === 'TEACHER' || role === 'MANAGER'

    if (isAdminRoute && !isStaff) {
      return NextResponse.redirect(new URL('/student/dashboard', request.url))
    }

    if (isStudentRoute && isStaff) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }

    return NextResponse.next()
 } catch (err) {
 return NextResponse.redirect(new URL('/login', request.url))
 }
}

export const config = {
 matcher: ['/admin/:path*', '/student/:path*']
}
