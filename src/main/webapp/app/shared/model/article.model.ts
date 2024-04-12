import dayjs from 'dayjs';
import { IFlag } from 'app/shared/model/flag.model';
import { ISynonym } from 'app/shared/model/synonym.model';
import { IAssociation } from 'app/shared/model/association.model';
import { IFdaSubmission } from 'app/shared/model/fda-submission.model';
import { ArticleType } from 'app/shared/model/enumerations/article-type.model';

export interface IArticle {
  id?: number;
  type?: ArticleType;
  uid?: string | null;
  title?: string | null;
  content?: string | null;
  link?: string | null;
  authors?: string | null;
  date?: string | null;
  flags?: IFlag[] | null;
  synonyms?: ISynonym[] | null;
  associations?: IAssociation[] | null;
  fdaSubmissions?: IFdaSubmission[] | null;
}

export const defaultValue: Readonly<IArticle> = {};
