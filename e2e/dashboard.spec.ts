import { expect, test, type Page } from '@playwright/test'

async function login(page: Page) {
  await page.getByLabel('E-mail').fill('admin@bix.com.br')
  await page.getByLabel('Senha').fill('bix@2024')
  await page.getByRole('button', { name: 'Entrar' }).click()
}

test('rotas protegidas redirecionam para o login e voltam à origem', async ({ page }) => {
  await page.goto('/dashboard?states=TX')
  await expect(page).toHaveURL(/\/login\?from=/)

  await login(page)

  await expect(page).toHaveURL(/\/dashboard\?states=TX/)
  await expect(page.getByRole('heading', { name: /Olá/ })).toBeVisible()
})

test('credenciais inválidas exibem erro', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('E-mail').fill('admin@bix.com.br')
  await page.getByLabel('Senha').fill('errada')
  await page.getByRole('button', { name: 'Entrar' }).click()

  await expect(page.getByRole('alert').filter({ hasText: 'inválidos' })).toHaveText(
    'E-mail ou senha inválidos.',
  )
})

test('filtros atualizam a dashboard e persistem após recarregar', async ({ page }) => {
  await page.goto('/login')
  await login(page)
  await expect(page.getByText('50.000 transações no período')).toBeVisible()

  await page.getByLabel('Estados').click()
  await page.getByRole('option', { name: 'TX', exact: true }).click()
  await page.keyboard.press('Escape')

  await expect(page).toHaveURL(/states=TX/)
  await expect(page.getByText('50.000 transações no período')).toBeHidden()

  // Sem query, o proxy restaura os últimos filtros salvos em cookie.
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/states=TX/)
})

test('logout encerra a sessão', async ({ page, isMobile }) => {
  await page.goto('/login')
  await login(page)
  await expect(page.getByRole('heading', { name: /Olá/ })).toBeVisible()

  if (isMobile) await page.getByRole('button', { name: 'Abrir menu' }).click()
  await page.getByRole('button', { name: 'Sair' }).click()

  await expect(page).toHaveURL(/\/login/)
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/\/login/)
})
