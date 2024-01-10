import { IAssociation } from 'app/shared/model/association.model';
import { ArticleType } from 'app/shared/model/enumerations/article-type.model';

export interface IArticle {
  id?: number;
  type?: ArticleType;
  content?: string | null;
  link?: string | null;
  pmid?: string | null;
  elocationId?: string | null;
  title?: string | null;
  authors?: string | null;
  journal?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  pubDate?: string | null;
  associations?: IAssociation[] | null;
}

export const defaultValue: Readonly<IArticle> = {};
