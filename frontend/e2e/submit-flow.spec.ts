import { expect, test } from '@playwright/test'

test('completes the account submission flow', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByLabel('Account readiness')).toContainText('of 4 ready')
  await expect(page.getByRole('button', { name: 'Submit accounts' })).toBeDisabled()

  await page.getByRole('button', { name: 'Upload statement' }).first().click()
  await page.getByLabel('Filename').fill('hsbc-august.pdf')
  await page.getByLabel('Statement date').fill('2026-08-01')
  await page.getByRole('button', { name: 'Save statement' }).click()
  await expect(page.getByText('Statement saved successfully.')).toBeVisible()

  await page.getByRole('article').filter({ hasText: 'Vanguard' }).getByRole('button', { name: 'Replace statement' }).click()
  await page.getByLabel('Filename').fill('vanguard-august.pdf')
  await page.getByLabel('Statement date').fill('2026-08-01')
  await page.getByRole('button', { name: 'Save statement' }).click()
  await expect(page.getByText('Statement saved successfully.')).toBeVisible()

  await expect(page.getByLabel('Account readiness')).toContainText('of 4 ready')
  await page.getByRole('button', { name: 'Submit accounts' }).click()
  await expect(page.getByText('Accounts submitted successfully.')).toBeVisible()
})
