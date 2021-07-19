package org.mskcc.oncokb.transcript.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.transcript.web.rest.TestUtil;

class ClinicalTrialTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ClinicalTrial.class);
        ClinicalTrial clinicalTrial1 = new ClinicalTrial();
        clinicalTrial1.setId(1L);
        ClinicalTrial clinicalTrial2 = new ClinicalTrial();
        clinicalTrial2.setId(clinicalTrial1.getId());
        assertThat(clinicalTrial1).isEqualTo(clinicalTrial2);
        clinicalTrial2.setId(2L);
        assertThat(clinicalTrial1).isNotEqualTo(clinicalTrial2);
        clinicalTrial1.setId(null);
        assertThat(clinicalTrial1).isNotEqualTo(clinicalTrial2);
    }
}
