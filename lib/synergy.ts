// 2026-05-04: ?띿꽦 ?쒕꼫吏 蹂대꼫??怨꾩궛 ?좏떥由ы떚

type SynergySetting = {
  attribute: string
  bonus_type: string  // 'fixed' | 'percent'
  bonus_value: number
}

type WeaponForCalc = {
  hp_bonus: number
  attack_bonus: number
  attributes: string[]
}

type SynergyResult = {
  totalHpBonus: number
  totalAttackBonus: number
  synergyHpBonus: number
  synergyAttackBonus: number
  finalHp: number
  finalAttack: number
}

/**
 * 罹먮┃?곗쓽 ?μ갑 臾닿린?ㅼ뿉 ????⑹궛 ?ㅽ꺈 + ?쒕꼫吏 蹂대꼫?ㅻ? 怨꾩궛?쒕떎.
 * @param characterAttributes 罹먮┃?곗쓽 ?띿꽦 諛곗뿴
 * @param baseHp 罹먮┃??湲곕낯 泥대젰
 * @param baseAttack 罹먮┃??湲곕낯 怨듦꺽??+ * @param weapons ?μ갑??臾닿린 紐⑸줉
 * @param synergySettings DB?먯꽌 媛?몄삩 ?쒕꼫吏 ?ㅼ젙 紐⑸줉
 */
export function calculateStats(
  characterAttributes: string[],
  baseHp: number,
  baseAttack: number,
  weapons: WeaponForCalc[],
  synergySettings: SynergySetting[]
): SynergyResult {
  // 1. 臾닿린 蹂대꼫???⑹궛
  let totalHpBonus = 0
  let totalAttackBonus = 0
  for (const w of weapons) {
    totalHpBonus += w.hp_bonus
    totalAttackBonus += w.attack_bonus
  }

  // 2. ?쒕꼫吏 蹂대꼫??怨꾩궛
  // 罹먮┃???띿꽦怨?臾닿린 ?띿꽦???쇱튂?섎뒗 臾닿린?????異붽? 蹂대꼫???곸슜
  let synergyHpBonus = 0
  let synergyAttackBonus = 0

  const settingsMap = new Map(synergySettings.map(s => [s.attribute, s]))

  for (const weapon of weapons) {
    // 臾닿린???띿꽦 以?罹먮┃???띿꽦怨?寃뱀튂??寃껋쓣 李얠쓬
    const matchedAttrs = (weapon.attributes ?? []).filter(a => characterAttributes.includes(a))
    for (const attr of matchedAttrs) {
      const setting = settingsMap.get(attr)
      if (!setting) continue

      if (setting.bonus_type === 'fixed') {
        synergyHpBonus += setting.bonus_value
        synergyAttackBonus += setting.bonus_value
      } else if (setting.bonus_type === 'percent') {
        // ?대떦 臾닿린 蹂대꼫?ㅼ쓽 n% 異붽?
        synergyHpBonus += Math.floor(weapon.hp_bonus * setting.bonus_value / 100)
        synergyAttackBonus += Math.floor(weapon.attack_bonus * setting.bonus_value / 100)
      }
    }
  }

  const finalHp = baseHp + totalHpBonus + synergyHpBonus
  const finalAttack = baseAttack + totalAttackBonus + synergyAttackBonus

  return {
    totalHpBonus,
    totalAttackBonus,
    synergyHpBonus,
    synergyAttackBonus,
    finalHp,
    finalAttack,
  }
}
