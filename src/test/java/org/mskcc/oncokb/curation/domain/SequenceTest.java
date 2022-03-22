package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.domain.Sequence;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class SequenceTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Sequence.class);
        Sequence sequence1 = new Sequence();
        sequence1.setId(1L);
        Sequence sequence2 = new Sequence();
        sequence2.setId(sequence1.getId());
        assertThat(sequence1).isEqualTo(sequence2);
        sequence2.setId(2L);
        assertThat(sequence1).isNotEqualTo(sequence2);
        sequence1.setId(null);
        assertThat(sequence1).isNotEqualTo(sequence2);
    }
}
