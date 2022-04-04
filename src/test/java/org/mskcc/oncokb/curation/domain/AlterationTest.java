package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class AlterationTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Alteration.class);
        Alteration alteration1 = new Alteration();
        alteration1.setId(1L);
        Alteration alteration2 = new Alteration();
        alteration2.setId(alteration1.getId());
        assertThat(alteration1).isEqualTo(alteration2);
        alteration2.setId(2L);
        assertThat(alteration1).isNotEqualTo(alteration2);
        alteration1.setId(null);
        assertThat(alteration1).isNotEqualTo(alteration2);
    }
}
