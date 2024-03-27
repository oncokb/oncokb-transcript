package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class CategoricalAlterationTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CategoricalAlteration.class);
        CategoricalAlteration categoricalAlteration1 = new CategoricalAlteration();
        categoricalAlteration1.setId(1L);
        CategoricalAlteration categoricalAlteration2 = new CategoricalAlteration();
        categoricalAlteration2.setId(categoricalAlteration1.getId());
        assertThat(categoricalAlteration1).isEqualTo(categoricalAlteration2);
        categoricalAlteration2.setId(2L);
        assertThat(categoricalAlteration1).isNotEqualTo(categoricalAlteration2);
        categoricalAlteration1.setId(null);
        assertThat(categoricalAlteration1).isNotEqualTo(categoricalAlteration2);
    }
}
