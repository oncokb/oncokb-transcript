package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class BiomarkerAssociationTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(BiomarkerAssociation.class);
        BiomarkerAssociation biomarkerAssociation1 = new BiomarkerAssociation();
        biomarkerAssociation1.setId(1L);
        BiomarkerAssociation biomarkerAssociation2 = new BiomarkerAssociation();
        biomarkerAssociation2.setId(biomarkerAssociation1.getId());
        assertThat(biomarkerAssociation1).isEqualTo(biomarkerAssociation2);
        biomarkerAssociation2.setId(2L);
        assertThat(biomarkerAssociation1).isNotEqualTo(biomarkerAssociation2);
        biomarkerAssociation1.setId(null);
        assertThat(biomarkerAssociation1).isNotEqualTo(biomarkerAssociation2);
    }
}
