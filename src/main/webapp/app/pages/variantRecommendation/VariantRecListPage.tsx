import React, { useState, useEffect } from 'react';
import { CBIOPORTAL, ALL_FREQUENCY_FILE, TYPE_FREQUENCY_FILE, DETAILED_FREQUENCY_FILE } from 'app/config/constants/constants';
import { Container } from 'reactstrap';
import Tabs from 'app/components/tabs/tabs';
import {} from 'react-table';
import { variantRecommendClient } from '../../shared/api/clients';
import MutationAllFrequencyTab from './MutationAllFrequencyTab';
import MutationTypeFrequencyTab from './MutationTypeFrequencyTab';
import MutationDetailedFrequencyTab from './MutationDetailedFrequencyTab';
import ExternalLinkIcon from 'app/shared/icons/ExternalLinkIcon';
import './variant-recommendation.scss';
import { notifyError } from 'app/oncokb-commons/components/util/NotificationUtils';
import { JSONObject } from 'app/shared/api/generated/curation/api';

const VariantRecListPage = props => {
  const [allData, setAllData] = useState<JSONObject[]>([]);
  const [typeData, setTypeData] = useState<JSONObject[]>([]);
  const [detailedData, setDetailedData] = useState<JSONObject[]>([]);

  useEffect(() => {
    variantRecommendClient
      .requestData(ALL_FREQUENCY_FILE)
      .then(response => {
        setAllData(response.data);
      })
      .catch(err => {
        notifyError(err, 'Failed to fetch all cancer type frequency');
      });
    variantRecommendClient
      .requestData(TYPE_FREQUENCY_FILE)
      .then(response => {
        setTypeData(response.data);
      })
      .catch(err => {
        notifyError(err, 'Failed to fetch cancer type frequency');
      });
    variantRecommendClient
      .requestData(DETAILED_FREQUENCY_FILE)
      .then(response => {
        setDetailedData(response.data);
      })
      .catch(err => {
        notifyError(err, 'Failed to fetch detailed cancer type frequency');
      });
  }, []);

  return (
    <>
      <Container className="px-0 ms-2 mb-4">
        <div style={{ display: 'flex' }}>
          <h2>MSK-IMPACT Clinical Sequencing Cohort (MSK, Nat Med 2017)</h2>
          <span className="ms-2"></span>
          <a
            href="https://www.cbioportal.org/study/summary?id=msk_impact_2017"
            style={{ alignContent: 'flex-end', marginBottom: '0.5rem' }}
            target="_blank"
            rel="noopener noreferrer"
          >
            {CBIOPORTAL} <ExternalLinkIcon />
          </a>
        </div>
        <table className="meta-table">
          <thead>
            <tr>
              <th>Patient Count</th>
              <th>Mutation Count</th>
              <th>Update Date</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>35277</td>
              <td>24386</td>
              <td>08/21/2024</td>
            </tr>
          </tbody>
        </table>
      </Container>

      <Tabs
        tabs={[
          {
            title: 'All Cancer Type Frequency',
            content: <MutationAllFrequencyTab data={allData} />,
          },
          {
            title: 'Cancer Type Frequency',
            content: <MutationTypeFrequencyTab data={typeData} />,
          },
          {
            title: 'Detailed Cancer Type Frequency',
            content: <MutationDetailedFrequencyTab data={detailedData} />,
          },
        ]}
      />
    </>
  );
};

export default VariantRecListPage;
