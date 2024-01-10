package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class ClinicalTrialArmTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ClinicalTrialArm.class);
        ClinicalTrialArm clinicalTrialArm1 = new ClinicalTrialArm();
        clinicalTrialArm1.setId(1L);
        ClinicalTrialArm clinicalTrialArm2 = new ClinicalTrialArm();
        clinicalTrialArm2.setId(clinicalTrialArm1.getId());
        assertThat(clinicalTrialArm1).isEqualTo(clinicalTrialArm2);
        clinicalTrialArm2.setId(2L);
        assertThat(clinicalTrialArm1).isNotEqualTo(clinicalTrialArm2);
        clinicalTrialArm1.setId(null);
        assertThat(clinicalTrialArm1).isNotEqualTo(clinicalTrialArm2);
    }
}
