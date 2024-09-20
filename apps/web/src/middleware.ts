import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);
const isAccountRoute = createRouteMatcher(["/login(.*)", "/signup(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (new URL(req.url).pathname.startsWith("/api/app/v1")) {
    return 
  }

  /* let u = auth();
  if (isProtectedRoute(req) && u.userId === null && !isAccountRoute(req)) {
    return NextResponse.redirect(new URL("/login", req.url));
  } */
  auth().protect();
})
