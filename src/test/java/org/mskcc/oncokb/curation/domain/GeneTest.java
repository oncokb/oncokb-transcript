package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class GeneTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Gene.class);
        Gene gene1 = new Gene();
        gene1.setId(1L);
        Gene gene2 = new Gene();
        gene2.setId(gene1.getId());
        assertThat(gene1).isEqualTo(gene2);
        gene2.setId(2L);
        assertThat(gene1).isNotEqualTo(gene2);
        gene1.setId(null);
        assertThat(gene1).isNotEqualTo(gene2);
    }
}
