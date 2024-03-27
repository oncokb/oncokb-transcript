package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class EligibilityCriteriaTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(EligibilityCriteria.class);
        EligibilityCriteria eligibilityCriteria1 = new EligibilityCriteria();
        eligibilityCriteria1.setId(1L);
        EligibilityCriteria eligibilityCriteria2 = new EligibilityCriteria();
        eligibilityCriteria2.setId(eligibilityCriteria1.getId());
        assertThat(eligibilityCriteria1).isEqualTo(eligibilityCriteria2);
        eligibilityCriteria2.setId(2L);
        assertThat(eligibilityCriteria1).isNotEqualTo(eligibilityCriteria2);
        eligibilityCriteria1.setId(null);
        assertThat(eligibilityCriteria1).isNotEqualTo(eligibilityCriteria2);
    }
}
