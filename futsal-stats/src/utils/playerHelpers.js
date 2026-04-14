/**
 * Returns the quadros array for a player, handling old data format
 * (old: player.quadro = 'Quadro 1', new: player.quadros = ['Quadro 1', 'Quadro 2'])
 */
export function getPlayerQuadros(player) {
  if (Array.isArray(player?.quadros) && player.quadros.length > 0) return player.quadros
  if (player?.quadro) return [player.quadro]
  return ['Quadro 1']
}
