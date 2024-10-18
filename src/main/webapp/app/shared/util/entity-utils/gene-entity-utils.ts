import { IFlag } from 'app/shared/model/flag.model';
import { IGene } from 'app/shared/model/gene.model';

export function geneIsReleased(gene: IGene): boolean {
  return (gene.flags || []).some(flag => flag.type === 'GENE_PANEL' && flag.flag === 'ONCOKB');
}
