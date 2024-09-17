import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware((auth, req) => {
  if (new URL(req.url).pathname.startsWith("/api/app/v1")) {
    return 
  }

  if (isProtectedRoute(req)) {
    auth().protect();
  }
})
