package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class SpecimenTypeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(SpecimenType.class);
        SpecimenType specimenType1 = new SpecimenType();
        specimenType1.setId(1L);
        SpecimenType specimenType2 = new SpecimenType();
        specimenType2.setId(specimenType1.getId());
        assertThat(specimenType1).isEqualTo(specimenType2);
        specimenType2.setId(2L);
        assertThat(specimenType1).isNotEqualTo(specimenType2);
        specimenType1.setId(null);
        assertThat(specimenType1).isNotEqualTo(specimenType2);
    }
}
