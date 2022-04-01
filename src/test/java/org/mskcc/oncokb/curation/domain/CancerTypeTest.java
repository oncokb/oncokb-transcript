package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class CancerTypeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CancerType.class);
        CancerType cancerType1 = new CancerType();
        cancerType1.setId(1L);
        CancerType cancerType2 = new CancerType();
        cancerType2.setId(cancerType1.getId());
        assertThat(cancerType1).isEqualTo(cancerType2);
        cancerType2.setId(2L);
        assertThat(cancerType1).isNotEqualTo(cancerType2);
        cancerType1.setId(null);
        assertThat(cancerType1).isNotEqualTo(cancerType2);
    }
}
