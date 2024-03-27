import { COLLAPSIBLE_LEVELS, GREY } from 'app/config/colors';

export enum NestLevelType {
  MUTATION,
  MUTATION_EFFECT,
  PENETRANCE,
  INHERITANCE_MECHANISM,
  CANCER_RISK,
  CANCER_TYPE,
  DIAGNOSTIC,
  PROGNOSTIC,
  THERAPEUTIC,
  THERAPY,
}

export const NestLevelMapping: { [key in NestLevelType]: string } = {
  [NestLevelType.MUTATION]: '1',
  [NestLevelType.MUTATION_EFFECT]: '1',
  [NestLevelType.PENETRANCE]: '1',
  [NestLevelType.INHERITANCE_MECHANISM]: '1',
  [NestLevelType.CANCER_RISK]: '1',
  [NestLevelType.CANCER_TYPE]: '2',
  [NestLevelType.DIAGNOSTIC]: '3',
  [NestLevelType.PROGNOSTIC]: '3',
  [NestLevelType.THERAPEUTIC]: '3',
  [NestLevelType.THERAPY]: '4',
};

export enum NestLevel {
  LEVEL_1 = '1',
  LEVEL_2 = '2',
  LEVEL_3 = '3',
  LEVEL_4 = '4',
}

export const NestLevelColor: { [key in NestLevel]: string } = {
  [NestLevel.LEVEL_1]: COLLAPSIBLE_LEVELS['1'],
  [NestLevel.LEVEL_2]: COLLAPSIBLE_LEVELS['2'],
  [NestLevel.LEVEL_3]: COLLAPSIBLE_LEVELS['3'],
  [NestLevel.LEVEL_4]: COLLAPSIBLE_LEVELS['4'],
};

export const DISABLED_NEST_LEVEL_COLOR = GREY;

export type RemovableNestLevel = NestLevelType.MUTATION | NestLevelType.CANCER_TYPE | NestLevelType.THERAPY;
