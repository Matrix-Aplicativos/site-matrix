// middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import axios from 'axios';
import { getUserFromToken } from '../utils/functions/getUserFromToken';

const baseApiUrl = process.env.NEXT_PUBLIC_API_URL;

const publicRoutes = ['/Login', '/Esqueceu-a-senha'];

// Rotas públicas por painel (se necessário)
const publicRoutesPorPainel = {
  fdv: ['/fdv/Login', '/fdv/Esqueceu-a-senha'],
  coletas: ['/coletas/Login'],
};

export default async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Verifica se está acessando painel FDV ou Coletas
  const isFDV = path.startsWith('/fdv');
  const isColetas = path.startsWith('/coletas');

  const painel = isFDV ? 'fdv' : isColetas ? 'coletas' : null;

  // Se não for um painel conhecido, não faz nada
  if (!painel) {
    return NextResponse.next();
  }

  // Se for rota pública, deixa passar
  const isPublicRoute = publicRoutesPorPainel[painel]?.includes(path);
  if (isPublicRoute) return NextResponse.next();

  const tokenSession = cookies().get('token')?.value;
  const rt = cookies().get('refreshToken')?.value;

  if (tokenSession) {
    try {
      const currentUser = getUserFromToken(tokenSession);
      await axios(`${baseApiUrl}/usuario/${currentUser}`, {
        method: 'GET',
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${tokenSession}`,
          'Content-Type': 'application/json',
        },
      });

      return NextResponse.next();
    } catch (err) {
      return NextResponse.redirect(new URL(`/${painel}/Login`, req.nextUrl));
    }
  }

  if (rt) return NextResponse.next();

  // Redireciona para login específico do painel
  return NextResponse.redirect(new URL(`/${painel}/Login`, req.nextUrl));
}

export const config = {
  matcher: [
    '/fdv/:path*',
    '/coletas/:path*',
  ],
};
