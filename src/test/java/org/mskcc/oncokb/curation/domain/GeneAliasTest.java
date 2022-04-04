package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class GeneAliasTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(GeneAlias.class);
        GeneAlias geneAlias1 = new GeneAlias();
        geneAlias1.setId(1L);
        GeneAlias geneAlias2 = new GeneAlias();
        geneAlias2.setId(geneAlias1.getId());
        assertThat(geneAlias1).isEqualTo(geneAlias2);
        geneAlias2.setId(2L);
        assertThat(geneAlias1).isNotEqualTo(geneAlias2);
        geneAlias1.setId(null);
        assertThat(geneAlias1).isNotEqualTo(geneAlias2);
    }
}
