import { LEVELS } from 'app/config/colors';

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

export const NestLevelColor: { [key in NestLevel]: string } = {
  [NestLevel.LEVEL_1]: LEVELS['1'],
  [NestLevel.LEVEL_2]: LEVELS['2'],
  [NestLevel.LEVEL_3]: LEVELS['3'],
};

export type RemovableNestLevel = NestLevelType.MUTATION | NestLevelType.CANCER_TYPE | NestLevelType.THERAPY;
