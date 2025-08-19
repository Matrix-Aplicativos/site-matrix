import { NextRequest, NextResponse } from "next/server";
import { getUserFromToken } from "./app/getUserFromToken";

const publicRoutes = [
  "/",
  "/Painel-FDV/Login",
  "/Painel-Coletas/Login",
  "/Redefinir-Senha",
];

export default function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Rotas públicas não precisam de autenticação
  if (publicRoutes.includes(path)) {
    return NextResponse.next();
  }

  const token = req.cookies.get("token")?.value;

  if (token) {
    try {
      // Se conseguir decodificar o token, deixa passar
      getUserFromToken(token);
      return NextResponse.next();
    } catch {
      // Token inválido → redireciona pro login correto
      return redirectToLogin(path, req);
    }
  }

  // Sem token → redireciona pro login correto
  return redirectToLogin(path, req);
}

function redirectToLogin(path: string, req: NextRequest) {
  if (path.startsWith("/Painel-Coletas")) {
    return NextResponse.redirect(new URL("/Painel-Coletas/Login", req.url));
  }
  if (path.startsWith("/Painel-FDV")) {
    return NextResponse.redirect(new URL("/Painel-FDV/Login", req.url));
  }
  // fallback
  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
