package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class AlleleStateTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AlleleState.class);
        AlleleState alleleState1 = new AlleleState();
        alleleState1.setId(1L);
        AlleleState alleleState2 = new AlleleState();
        alleleState2.setId(alleleState1.getId());
        assertThat(alleleState1).isEqualTo(alleleState2);
        alleleState2.setId(2L);
        assertThat(alleleState1).isNotEqualTo(alleleState2);
        alleleState1.setId(null);
        assertThat(alleleState1).isNotEqualTo(alleleState2);
    }
}
