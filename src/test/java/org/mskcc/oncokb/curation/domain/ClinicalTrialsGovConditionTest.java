package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class ClinicalTrialsGovConditionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ClinicalTrialsGovCondition.class);
        ClinicalTrialsGovCondition clinicalTrialsGovCondition1 = new ClinicalTrialsGovCondition();
        clinicalTrialsGovCondition1.setId(1L);
        ClinicalTrialsGovCondition clinicalTrialsGovCondition2 = new ClinicalTrialsGovCondition();
        clinicalTrialsGovCondition2.setId(clinicalTrialsGovCondition1.getId());
        assertThat(clinicalTrialsGovCondition1).isEqualTo(clinicalTrialsGovCondition2);
        clinicalTrialsGovCondition2.setId(2L);
        assertThat(clinicalTrialsGovCondition1).isNotEqualTo(clinicalTrialsGovCondition2);
        clinicalTrialsGovCondition1.setId(null);
        assertThat(clinicalTrialsGovCondition1).isNotEqualTo(clinicalTrialsGovCondition2);
    }
}
