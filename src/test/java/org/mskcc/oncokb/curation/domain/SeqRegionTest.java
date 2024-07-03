package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class SeqRegionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(SeqRegion.class);
        SeqRegion seqRegion1 = new SeqRegion();
        seqRegion1.setId(1L);
        SeqRegion seqRegion2 = new SeqRegion();
        seqRegion2.setId(seqRegion1.getId());
        assertThat(seqRegion1).isEqualTo(seqRegion2);
        seqRegion2.setId(2L);
        assertThat(seqRegion1).isNotEqualTo(seqRegion2);
        seqRegion1.setId(null);
        assertThat(seqRegion1).isNotEqualTo(seqRegion2);
    }
}
