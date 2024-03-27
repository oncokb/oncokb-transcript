package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class LevelOfEvidenceTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(LevelOfEvidence.class);
        LevelOfEvidence levelOfEvidence1 = new LevelOfEvidence();
        levelOfEvidence1.setId(1L);
        LevelOfEvidence levelOfEvidence2 = new LevelOfEvidence();
        levelOfEvidence2.setId(levelOfEvidence1.getId());
        assertThat(levelOfEvidence1).isEqualTo(levelOfEvidence2);
        levelOfEvidence2.setId(2L);
        assertThat(levelOfEvidence1).isNotEqualTo(levelOfEvidence2);
        levelOfEvidence1.setId(null);
        assertThat(levelOfEvidence1).isNotEqualTo(levelOfEvidence2);
    }
}
