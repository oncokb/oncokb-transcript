package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class GenomicIndicatorTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(GenomicIndicator.class);
        GenomicIndicator genomicIndicator1 = new GenomicIndicator();
        genomicIndicator1.setId(1L);
        GenomicIndicator genomicIndicator2 = new GenomicIndicator();
        genomicIndicator2.setId(genomicIndicator1.getId());
        assertThat(genomicIndicator1).isEqualTo(genomicIndicator2);
        genomicIndicator2.setId(2L);
        assertThat(genomicIndicator1).isNotEqualTo(genomicIndicator2);
        genomicIndicator1.setId(null);
        assertThat(genomicIndicator1).isNotEqualTo(genomicIndicator2);
    }
}
