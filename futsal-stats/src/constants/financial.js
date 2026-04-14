export const INCOME_CATEGORIES = [
  'Mensalidade',
  'Contribuição',
  'Patrocínio',
  'Doação',
  'Outros',
]

export const EXPENSE_CATEGORIES = [
  'Aluguel de quadra',
  'Arbitragem',
  'Material esportivo',
  'Transporte',
  'Alimentação',
  'Premiação',
  'Outros',
]

export function getCategories(type) {
  return type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES
}
