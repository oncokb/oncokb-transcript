package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class EnsemblGeneTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(EnsemblGene.class);
        EnsemblGene ensemblGene1 = new EnsemblGene();
        ensemblGene1.setId(1L);
        EnsemblGene ensemblGene2 = new EnsemblGene();
        ensemblGene2.setId(ensemblGene1.getId());
        assertThat(ensemblGene1).isEqualTo(ensemblGene2);
        ensemblGene2.setId(2L);
        assertThat(ensemblGene1).isNotEqualTo(ensemblGene2);
        ensemblGene1.setId(null);
        assertThat(ensemblGene1).isNotEqualTo(ensemblGene2);
    }
}
