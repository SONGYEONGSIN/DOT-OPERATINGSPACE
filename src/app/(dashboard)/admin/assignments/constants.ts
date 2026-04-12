export const OPERATOR_GROUPS = [
  {
    group: 1,
    label: "1그룹",
    operators: ["한효진", "윤지혜", "박시현", "김슬기"],
  },
  { group: 2, label: "2그룹", operators: ["김지영", "이해영"] },
  { group: 3, label: "3그룹", operators: ["정윤나", "임종우"] },
  { group: 4, label: "4그룹", operators: ["김유민", "전혜인"] },
  { group: 5, label: "5그룹", operators: ["기자의", "김지현"] },
  { group: 6, label: "6그룹", operators: ["전지은", "김지나", "김승현"] },
] as const;

export const ALL_OPERATORS = OPERATOR_GROUPS.flatMap((g) => g.operators);
