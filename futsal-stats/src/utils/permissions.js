// Papéis no time:
//   admin   -> "Gestor do Time": controle total, inclui financeiro
//   gestor  -> edita elenco e partidas, SEM financeiro
//   leitura -> vê tudo MENOS financeiro, não edita

export const ROLE_LABELS = {
  admin: 'Gestor do Time',
  gestor: 'Gestor',
  leitura: 'Leitura',
}

export const ROLE_DESCRIPTIONS = {
  admin: 'Controle total, inclui financeiro',
  gestor: 'Edita elenco e partidas (sem financeiro)',
  leitura: 'Apenas visualiza (sem financeiro)',
}

// pode criar/editar/excluir elenco e partidas
export function canEdit(role) {
  return role === 'admin' || role === 'gestor'
}

// pode gerenciar membros, configurações do time e excluir o time
export function canManageTeam(role) {
  return role === 'admin'
}

// pode ver e editar o financeiro
export function canSeeFinance(role) {
  return role === 'admin'
}
