package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class VariantConsequenceTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(VariantConsequence.class);
        VariantConsequence variantConsequence1 = new VariantConsequence();
        variantConsequence1.setId(1L);
        VariantConsequence variantConsequence2 = new VariantConsequence();
        variantConsequence2.setId(variantConsequence1.getId());
        assertThat(variantConsequence1).isEqualTo(variantConsequence2);
        variantConsequence2.setId(2L);
        assertThat(variantConsequence1).isNotEqualTo(variantConsequence2);
        variantConsequence1.setId(null);
        assertThat(variantConsequence1).isNotEqualTo(variantConsequence2);
    }
}
