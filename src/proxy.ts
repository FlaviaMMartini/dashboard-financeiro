import { NextResponse, type NextRequest } from 'next/server'

import { parseFilters, serializeFilters, toSearchParamsRecord } from '@/domain/filters'
import { parseTableParams, serializeTableParams } from '@/domain/table'
import { DASHBOARD_PATH, LOGIN_PATH } from '@/features/auth/redirect'
import { SESSION_COOKIE, verifySessionToken } from '@/features/auth/session'

export const FILTERS_COOKIE = 'bix_filters'
const FILTERS_MAX_AGE_SECONDS = 60 * 60 * 24 * 30

function redirectTo(request: NextRequest, pathnameWithSearch: string) {
  return NextResponse.redirect(new URL(pathnameWithSearch, request.url))
}

/**
 * Persistência dos filtros sem banco: a URL é a fonte de verdade e o último
 * estado válido é guardado em cookie. Ao voltar para `/dashboard` sem query,
 * o estado salvo é restaurado.
 */
function syncDashboardFilters(request: NextRequest) {
  const { searchParams } = request.nextUrl

  if (searchParams.size === 0) {
    const saved = request.cookies.get(FILTERS_COOKIE)?.value
    return saved ? redirectTo(request, `${DASHBOARD_PATH}?${saved}`) : NextResponse.next()
  }

  const record = toSearchParamsRecord(searchParams)
  const sanitized = serializeTableParams(
    parseTableParams(record),
    serializeFilters(parseFilters(record)),
  )
  const response = NextResponse.next()
  response.cookies.set(FILTERS_COOKIE, sanitized.toString(), {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: FILTERS_MAX_AGE_SECONDS,
  })
  return response
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const session = await verifySessionToken(request.cookies.get(SESSION_COOKIE)?.value)

  if (pathname.startsWith(DASHBOARD_PATH)) {
    if (!session) {
      const loginUrl = new URL(LOGIN_PATH, request.url)
      loginUrl.searchParams.set('from', `${pathname}${search}`)
      return NextResponse.redirect(loginUrl)
    }
    return syncDashboardFilters(request)
  }

  if (pathname === '/') return redirectTo(request, session ? DASHBOARD_PATH : LOGIN_PATH)
  if (pathname === LOGIN_PATH && session) return redirectTo(request, DASHBOARD_PATH)

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/login', '/dashboard/:path*'],
}
