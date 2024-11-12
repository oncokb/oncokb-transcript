import { REFERENCE_GENOME } from 'app/config/constants/constants';
import React from 'react';
import EnsemblIdLinkout from '../links/EnsemblIdLinkout';

export interface IEnsemblIdText {
  grch37: string;
  grch38: string;
}

const EnsemblIdText = ({ grch37, grch38 }: IEnsemblIdText) => {
  if (grch37 === grch38) {
    return (
      <span className={'d-flex'}>
        {grch37} (
        <EnsemblIdLinkout ensemblId={grch37} referenceGenome={REFERENCE_GENOME.GRCH37}>
          {REFERENCE_GENOME.GRCH37}
        </EnsemblIdLinkout>
        /
        <EnsemblIdLinkout ensemblId={grch38} referenceGenome={REFERENCE_GENOME.GRCH38}>
          {REFERENCE_GENOME.GRCH38}
        </EnsemblIdLinkout>
        )
      </span>
    );
  } else {
    return (
      <div className={'d-flex'}>
        {grch37 && (
          <div className={'d-flex ms-2'}>
            {grch37} (
            <EnsemblIdLinkout ensemblId={grch37} referenceGenome={REFERENCE_GENOME.GRCH37}>
              {REFERENCE_GENOME.GRCH37}
            </EnsemblIdLinkout>
            )
          </div>
        )}
        {grch38 && (
          <div className={'d-flex ms-2'}>
            {grch38} (
            <EnsemblIdLinkout ensemblId={grch38} referenceGenome={REFERENCE_GENOME.GRCH38}>
              {REFERENCE_GENOME.GRCH38}
            </EnsemblIdLinkout>
            )
          </div>
        )}
      </div>
    );
  }
};

export default EnsemblIdText;
