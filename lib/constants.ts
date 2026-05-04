export const LOCATIONS = ['장식장', '7층집', '텐트'] as const
export type Location = typeof LOCATIONS[number]

export const ATTRIBUTES = [
  '워터', '파이어', '아이스', '일렉트릭', '윈드', '아트',
  '중상자별', '트윙클', '백색왜성', '빛', '어둠', '독',
  '그리스화염', '폭발', '원념', '독기',
] as const

export const RACES = [
  '드래곤', '전설드래곤', '스톤', '요정', '식물', '고스트',
  '3반', '슬구', '소리', '시간', '하이점프', '김도윤',
  '로봇', '벌레', '비히클', '하트', '신', '반신반클', '전설',
] as const

export const BONUS_EFFECTS = [
  '스피디1', '스피디2', '스피디3',
  '연기', '유도',
  '은밀1', '은밀2', '은밀3',
  '공격업1', '공격업2', '공격업3',
  '방어1', '방어2', '방어3',
  '원기1', '원기2', '원기3',
  '힐1', '힐2', '힐3',
  '다양무기사용', '참격', '분쇄',
] as const

export const ATTRIBUTE_COLORS: Record<string, { bg: string; text: string }> = {
  파이어:     { bg: '#EF4444', text: '#fff' },
  워터:       { bg: '#3B82F6', text: '#fff' },
  아이스:     { bg: '#BAE6FD', text: '#1e40af' },
  일렉트릭:   { bg: '#FACC15', text: '#713f12' },
  윈드:       { bg: '#22C55E', text: '#fff' },
  아트:       { bg: '#EC4899', text: '#fff' },
  중상자별:   { bg: '#06B6D4', text: '#fff' },
  트윙클:     { bg: '#C4B5FD', text: '#4c1d95' },
  백색왜성:   { bg: '#F1F5F9', text: '#334155' },
  빛:         { bg: '#F59E0B', text: '#fff' },
  어둠:       { bg: '#8B5CF6', text: '#fff' },
  독:         { bg: '#A3E635', text: '#365314' },
  그리스화염: { bg: '#F97316', text: '#fff' },
  폭발:       { bg: '#DC2626', text: '#fff' },
  원념:       { bg: '#78350F', text: '#fff' },
  독기:       { bg: '#84CC16', text: '#fff' },
}
