import { IGene } from 'app/shared/model/gene.model';
import { IPayload, ISearchParams } from 'app/shared/util/jhipster-types';
import { useEffect, useState } from 'react';

export const useMatchGeneEntity = (
  hugoSymbolParam: string,
  searchGeneEntities: (params: ISearchParams) => IPayload<IGene[]>,
  geneEntities: readonly IGene[],
) => {
  const [geneEntity, setGeneEntity] = useState<IGene>(null);

  // Initiate a gene search whenever the hugo symbol search param changes
  useEffect(() => {
    searchGeneEntities({ query: hugoSymbolParam, exact: true });
  }, [hugoSymbolParam]);

  // When the search function returns results, find the gene that matches the search param
  useEffect(() => {
    const matchedGeneEntity = geneEntities?.find(gene => gene.hugoSymbol.toUpperCase() === hugoSymbolParam.toUpperCase());
    setGeneEntity(matchedGeneEntity);
  }, [geneEntities]);

  return { geneEntity, hugoSymbol: geneEntity?.hugoSymbol };
};
