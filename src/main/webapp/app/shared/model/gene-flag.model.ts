import dayjs from 'dayjs';
import { IGene } from 'app/shared/model/gene.model';

export interface IGeneFlag {
  id: number;
  flag: string;
  name: string;
  description: string;
  created: string | null;
  lastModified: string | null;
  genes: IGene[] | null;
}
