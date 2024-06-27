import { IAlteration } from 'app/shared/model/alteration.model';
import { IArticle } from 'app/shared/model/article.model';
import { IDrug } from 'app/shared/model/drug.model';
import { IGene } from 'app/shared/model/gene.model';
import { ITranscript } from 'app/shared/model/transcript.model';

export interface IFlag {
  id: number;
  type: string;
  flag: string;
  name: string;
  description: string;
  alterations: IAlteration[] | null;
  articles: IArticle[] | null;
  drugs: IDrug[] | null;
  genes: IGene[] | null;
  transcripts: ITranscript[] | null;
}
