import { ISynonym } from 'app/shared/model/synonym.model';

export interface INciThesaurus {
  id?: number;
  version?: string;
  code?: string;
  preferredName?: string | null;
  displayName?: string | null;
  synonyms?: ISynonym[] | null;
}

export const defaultValue: Readonly<INciThesaurus> = {};
