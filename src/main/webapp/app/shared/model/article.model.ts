export interface IArticle {
  id?: number;
  pmid?: string | null;
  title?: string | null;
  journal?: string | null;
  pubDate?: string | null;
  volume?: string | null;
  issue?: string | null;
  pages?: string | null;
  authors?: string | null;
}

export const defaultValue: Readonly<IArticle> = {};
