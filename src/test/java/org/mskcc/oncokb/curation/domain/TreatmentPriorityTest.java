package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class TreatmentPriorityTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TreatmentPriority.class);
        TreatmentPriority treatmentPriority1 = new TreatmentPriority();
        treatmentPriority1.setId(1L);
        TreatmentPriority treatmentPriority2 = new TreatmentPriority();
        treatmentPriority2.setId(treatmentPriority1.getId());
        assertThat(treatmentPriority1).isEqualTo(treatmentPriority2);
        treatmentPriority2.setId(2L);
        assertThat(treatmentPriority1).isNotEqualTo(treatmentPriority2);
        treatmentPriority1.setId(null);
        assertThat(treatmentPriority1).isNotEqualTo(treatmentPriority2);
    }
}
