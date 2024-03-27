package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class FdaSubmissionTypeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FdaSubmissionType.class);
        FdaSubmissionType fdaSubmissionType1 = new FdaSubmissionType();
        fdaSubmissionType1.setId(1L);
        FdaSubmissionType fdaSubmissionType2 = new FdaSubmissionType();
        fdaSubmissionType2.setId(fdaSubmissionType1.getId());
        assertThat(fdaSubmissionType1).isEqualTo(fdaSubmissionType2);
        fdaSubmissionType2.setId(2L);
        assertThat(fdaSubmissionType1).isNotEqualTo(fdaSubmissionType2);
        fdaSubmissionType1.setId(null);
        assertThat(fdaSubmissionType1).isNotEqualTo(fdaSubmissionType2);
    }
}
