import { IFlag } from 'app/shared/model/flag.model';
import { IGene } from 'app/shared/model/gene.model';

export function geneIsReleased(gene: IGene, isGermline: boolean): boolean {
  const flagFlag = isGermline ? 'ONCOKB_GERMLINE' : 'ONCOKB_SOMATIC';
  return (gene.flags || []).some(flag => flag.type === 'GENE_PANEL' && flag.flag === flagFlag);
}
