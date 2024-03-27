import React, { useEffect, useMemo } from 'react';
import { IRootStore } from 'app/stores';
import { connect } from 'app/shared/util/typed-inject';
import DefaultTooltip from 'app/shared/tooltip/DefaultTooltip';
import LoadingIndicator from 'app/oncokb-commons/components/loadingIndicator/LoadingIndicator';
import { PubMedDTO } from 'app/shared/api/generated';
import _ from 'lodash';
import { formatDate } from 'app/shared/util/utils';

const getPubMedContent = (pubMedDto: PubMedDTO) => {
  if (pubMedDto.additionalInfo?.abstractTexts?.length > 1) {
    return pubMedDto.additionalInfo.abstractTexts.map(text => (
      <p key={text.label}>
        <b>{_.capitalize(text.label)}</b>: {text.value}
      </p>
    ));
  } else {
    return pubMedDto.content;
  }
};

export interface IPubMedArticleTooltip extends StoreProps {
  pmid: string;
}

const PubMedArticleTooltipContent: React.FunctionComponent<IPubMedArticleTooltip> = props => {
  const getPubMedArticle = props.getPubMedArticle();

  useEffect(() => {
    getPubMedArticle.get(props.pmid);
  }, [props.pmid]);

  return useMemo(() => {
    if (getPubMedArticle.loading) {
      return <LoadingIndicator isLoading />;
    } else {
      if (getPubMedArticle.error) {
        return <div>Failed to fetch PubMed Article with error {getPubMedArticle.error.content}</div>;
      } else if (getPubMedArticle.pubMedArticle != null) {
        const pubMedDto: PubMedDTO = getPubMedArticle.pubMedArticle;
        const date = new Date(pubMedDto.date);
        return (
          <div>
            <h5>{pubMedDto.title}</h5>
            <p>
              {pubMedDto.authors}, {pubMedDto.additionalInfo.journal.isoAbbreviation}, on {formatDate(date, true)}
            </p>
            {pubMedDto.synonyms?.length > 0 && (
              <p>
                {pubMedDto.synonyms.map(synonym => (
                  <span className={'mr-2'} key={`${synonym.type}-${synonym.source}-${synonym.name}`}>
                    <b>{synonym.source === 'pubmed' ? 'PMID' : synonym.source?.toUpperCase()}</b>: {synonym.name}
                  </span>
                ))}
              </p>
            )}
            <p>
              <h6>Abstract</h6>
            </p>
            <p>{pubMedDto ? getPubMedContent(pubMedDto) : <i>No abstract available.</i>}</p>
            {pubMedDto.additionalInfo?.dataBanks?.length > 0 && (
              <>
                <p>
                  <h6>Associated Data</h6>
                </p>
                <p>
                  <ul>
                    {pubMedDto.additionalInfo.dataBanks.map(dataBank => (
                      <li key={dataBank.name}>
                        {dataBank.name}: {dataBank.accessionNumbers.join(', ')}
                      </li>
                    ))}
                  </ul>
                </p>
              </>
            )}
          </div>
        );
      } else {
        return <div></div>;
      }
    }
  }, [getPubMedArticle.loading]);
};
const PubMedArticleTooltip: React.FunctionComponent<IPubMedArticleTooltip> = props => {
  return (
    <DefaultTooltip
      overlay={<PubMedArticleTooltipContent {...props} />}
      size={'lg'}
      overlayInnerStyle={{ maxHeight: 400, overflowY: 'auto' }}
      placement={'top'}
    >
      {props.children}
    </DefaultTooltip>
  );
};
const mapStoreToProps = (storeState: IRootStore) => ({
  getPubMedArticle: storeState.articleStore.getPubMedArticle,
});

type StoreProps = ReturnType<typeof mapStoreToProps>;

export default connect(mapStoreToProps)(PubMedArticleTooltip);
