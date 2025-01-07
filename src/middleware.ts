import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import axios from 'axios'
import { getUserFromToken } from './app/utils/functions/getUserFromToken'
 
const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;

// 1. Specify protected and public routes
const publicRoutes = ['/Login', '/Esqueceu-a-senha']
 
export default async function authenticationMiddleware(req: NextRequest) {
  // 2. Check if the current route is protected or public
  const path = req.nextUrl.pathname
  console.log(path);
  const isPublicRoute = publicRoutes.includes(path)
  if(isPublicRoute){
    return NextResponse.next()
  }else{
  // 3. Get Token from cookies
  const tokenSession = await cookies().get('token')?.value;
  const rt = await cookies().get("refreshToken")?.value;
  const currentUser = getUserFromToken(tokenSession!);
  // 4. Check if the token is valid by fetching the user data from the API
    if (tokenSession) {
        try {
        const currentUser = getUserFromToken(tokenSession);
        console.log(baseApiUrl);
        console.log("Usuario Atual:",currentUser);
        const response = await axios(`${baseApiUrl}/usuario/${currentUser}`,{method: "GET", withCredentials: true, headers: {Authorization: `Bearer ${tokenSession}`,"Content-Type": "application/json"}});

        return NextResponse.next();
      }
        catch(err){
            return NextResponse.redirect(new URL('/Login', req.nextUrl))
        }
    }else{
        if(rt){
          return NextResponse.next();
    }
  // 4. Redirect to /login if the user is not authenticated
  if (tokenSession === undefined) {
    return NextResponse.redirect(new URL('/Login', req.nextUrl))
  }
 
  return NextResponse.next()
}
  }
}
 
export const config = {
  matcher: ['/((?!Login|api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)'],
}