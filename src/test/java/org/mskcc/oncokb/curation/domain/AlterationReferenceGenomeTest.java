package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class AlterationReferenceGenomeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AlterationReferenceGenome.class);
        AlterationReferenceGenome alterationReferenceGenome1 = new AlterationReferenceGenome();
        alterationReferenceGenome1.setId(1L);
        AlterationReferenceGenome alterationReferenceGenome2 = new AlterationReferenceGenome();
        alterationReferenceGenome2.setId(alterationReferenceGenome1.getId());
        assertThat(alterationReferenceGenome1).isEqualTo(alterationReferenceGenome2);
        alterationReferenceGenome2.setId(2L);
        assertThat(alterationReferenceGenome1).isNotEqualTo(alterationReferenceGenome2);
        alterationReferenceGenome1.setId(null);
        assertThat(alterationReferenceGenome1).isNotEqualTo(alterationReferenceGenome2);
    }
}
