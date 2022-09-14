import dayjs from 'dayjs';
import { IArticleFullText } from 'app/shared/model/article-full-text.model';

export interface IArticle {
  id?: number;
  pmid?: string | null;
  pmcid?: string | null;
  doi?: string | null;
  title?: string | null;
  pubAbstract?: string | null;
  pubDate?: string | null;
  journal?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  authors?: string | null;
  meshTerms?: string | null;
  fullText?: IArticleFullText | null;
}

export const defaultValue: Readonly<IArticle> = {};
