'use client'

import HomeOutlined from '@mui/icons-material/HomeOutlined'
import Logout from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import Drawer from '@mui/material/Drawer'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Link from 'next/link'
import { useState, useTransition, type ReactNode } from 'react'
import styled from 'styled-components'

import { Logo } from '@/components/logo'
import { logout } from '@/features/auth/actions'
import { DASHBOARD_PATH } from '@/features/auth/redirect'
import { media } from '@/styles/theme'

const Layout = styled.div`
  min-height: 100vh;

  ${media.md} {
    display: grid;
    grid-template-columns: ${({ theme }) => theme.sidebarWidth}px minmax(0, 1fr);
  }
`

/** Barra superior exibida apenas em telas pequenas, onde a sidebar vira um drawer. */
const MobileBar = styled.header`
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 56px;
  padding: 0 8px;
  background: ${({ theme }) => theme.colors.navy};

  ${media.md} {
    display: none;
  }

  && .MuiIconButton-root {
    color: ${({ theme }) => theme.colors.surface};
  }
`

const DesktopSidebar = styled.aside`
  display: none;

  ${media.md} {
    display: block;
    position: sticky;
    top: 0;
    height: 100vh;
  }
`

const SidebarPanel = styled.nav`
  display: flex;
  flex-direction: column;
  width: ${({ theme }) => theme.sidebarWidth}px;
  height: 100%;
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.navy};
  color: ${({ theme }) => theme.colors.surface};
`

const Brand = styled.div`
  display: flex;
  align-items: center;
  height: 64px;
  padding: 0 24px;
`

/** Estilizamos a lista (e não o botão) para manter o `component={Link}` polimórfico do MUI. */
const NavList = styled(List)`
  && .MuiListItemButton-root {
    margin: 4px 12px;
    border-radius: ${({ theme }) => theme.radii.sm};
    color: rgba(255, 255, 255, 0.8);
  }

  && .MuiListItemIcon-root {
    min-width: 36px;
    color: inherit;
  }

  && .MuiListItemButton-root:hover {
    background: ${({ theme }) => theme.colors.navyLight};
    color: ${({ theme }) => theme.colors.surface};
  }

  && .MuiListItemButton-root.Mui-selected {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.surface};
  }
`

interface SidebarContentProps {
  onNavigate?: () => void
}

function SidebarContent({ onNavigate }: SidebarContentProps) {
  const [isLoggingOut, startTransition] = useTransition()

  return (
    <SidebarPanel aria-label="Menu principal">
      <Brand>
        <Logo inverted />
      </Brand>
      <NavList>
        <ListItemButton selected component={Link} href={DASHBOARD_PATH} onClick={onNavigate}>
          <ListItemIcon>
            <HomeOutlined />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>
        <ListItemButton disabled={isLoggingOut} onClick={() => startTransition(() => logout())}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          <ListItemText primary="Sair" />
        </ListItemButton>
      </NavList>
    </SidebarPanel>
  )
}

interface DashboardShellProps {
  children: ReactNode
}

/** Layout exclusivo da dashboard: sidebar fixa no desktop e drawer no mobile. */
export function DashboardShell({ children }: DashboardShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const closeMobile = () => setMobileOpen(false)

  return (
    <Layout>
      <MobileBar>
        <IconButton aria-label="Abrir menu" onClick={() => setMobileOpen(true)}>
          <MenuIcon />
        </IconButton>
        <Logo inverted />
      </MobileBar>
      <Drawer open={mobileOpen} onClose={closeMobile} ModalProps={{ keepMounted: true }}>
        <SidebarContent onNavigate={closeMobile} />
      </Drawer>
      <DesktopSidebar>
        <SidebarContent />
      </DesktopSidebar>
      <main>{children}</main>
    </Layout>
  )
}
