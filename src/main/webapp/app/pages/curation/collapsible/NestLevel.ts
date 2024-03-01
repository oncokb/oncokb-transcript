import { GREY, LEVELS } from 'app/config/colors';

export enum NestLevelType {
  MUTATION,
  MUTATION_EFFECT,
  SOMATIC,
  GERMLINE,
  CANCER_TYPE,
  DIAGNOSTIC,
  PROGNOSTIC,
  THERAPY,
}

export const NestLevelMapping: { [key in NestLevelType]: string } = {
  [NestLevelType.MUTATION]: '1',
  [NestLevelType.MUTATION_EFFECT]: '2',
  [NestLevelType.SOMATIC]: '3',
  [NestLevelType.GERMLINE]: '3',
  [NestLevelType.CANCER_TYPE]: '2',
  [NestLevelType.DIAGNOSTIC]: '3',
  [NestLevelType.PROGNOSTIC]: '3',
  [NestLevelType.THERAPY]: '3',
};

export enum NestLevel {
  LEVEL_1 = '1',
  LEVEL_2 = '2',
  LEVEL_3 = '3',
}

export const NestLevelColor: { [key in NestLevelType]: { borderLeftColor: string; backgroundColor?: string } } = {
  [NestLevelType.MUTATION]: { borderLeftColor: LEVELS[1], backgroundColor: LEVELS[1] },
  [NestLevelType.MUTATION_EFFECT]: { borderLeftColor: LEVELS[1] },
  [NestLevelType.CANCER_TYPE]: { borderLeftColor: LEVELS[2], backgroundColor: LEVELS[2] },
  [NestLevelType.THERAPY]: { borderLeftColor: LEVELS[3], backgroundColor: LEVELS[3] },
  [NestLevelType.DIAGNOSTIC]: { borderLeftColor: LEVELS[3] },
  [NestLevelType.PROGNOSTIC]: { borderLeftColor: LEVELS[3] },
  [NestLevelType.SOMATIC]: { borderLeftColor: LEVELS[3] },
  [NestLevelType.GERMLINE]: { borderLeftColor: LEVELS[3] },
};

export const DISABLED_NEST_LEVEL_COLOR = GREY;

export type RemovableNestLevel = NestLevelType.MUTATION | NestLevelType.CANCER_TYPE | NestLevelType.THERAPY;
