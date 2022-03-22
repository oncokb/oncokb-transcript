package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.domain.GenomeFragment;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class GenomeFragmentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(GenomeFragment.class);
        GenomeFragment genomeFragment1 = new GenomeFragment();
        genomeFragment1.setId(1L);
        GenomeFragment genomeFragment2 = new GenomeFragment();
        genomeFragment2.setId(genomeFragment1.getId());
        assertThat(genomeFragment1).isEqualTo(genomeFragment2);
        genomeFragment2.setId(2L);
        assertThat(genomeFragment1).isNotEqualTo(genomeFragment2);
        genomeFragment1.setId(null);
        assertThat(genomeFragment1).isNotEqualTo(genomeFragment2);
    }
}
