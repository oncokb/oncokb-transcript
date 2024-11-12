import { REFERENCE_GENOME } from 'app/config/constants/constants';
import RefSeqLinkout from '../links/RefSeqLinkout';
import React from 'react';

export interface IRefSeqText {
  grch37: string;
  grch38: string;
}

const RefSeqText = ({ grch37, grch38 }: IRefSeqText) => {
  if (grch37 === grch38) {
    return (
      <span className={'d-flex'}>
        {grch37} (
        <RefSeqLinkout refSeq={grch37} referenceGenome={REFERENCE_GENOME.GRCH37}>
          {REFERENCE_GENOME.GRCH37}
        </RefSeqLinkout>
        /
        <RefSeqLinkout refSeq={grch38} referenceGenome={REFERENCE_GENOME.GRCH38}>
          {REFERENCE_GENOME.GRCH38}
        </RefSeqLinkout>
        )
      </span>
    );
  } else {
    return (
      <div className={'d-flex'}>
        {grch37 && (
          <div className="d-flex ms-2">
            {grch37} (
            <RefSeqLinkout refSeq={grch37} referenceGenome={REFERENCE_GENOME.GRCH37}>
              {REFERENCE_GENOME.GRCH37}
            </RefSeqLinkout>
            )
          </div>
        )}
        {grch38 && (
          <div className="d-flex ms-2">
            {grch38}
            <RefSeqLinkout refSeq={grch38} referenceGenome={REFERENCE_GENOME.GRCH38}>
              {REFERENCE_GENOME.GRCH38}
            </RefSeqLinkout>
          </div>
        )}
      </div>
    );
  }
};

export default RefSeqText;
