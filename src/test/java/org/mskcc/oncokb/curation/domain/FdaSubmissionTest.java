package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class FdaSubmissionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FdaSubmission.class);
        FdaSubmission fdaSubmission1 = new FdaSubmission();
        fdaSubmission1.setId(1L);
        FdaSubmission fdaSubmission2 = new FdaSubmission();
        fdaSubmission2.setId(fdaSubmission1.getId());
        assertThat(fdaSubmission1).isEqualTo(fdaSubmission2);
        fdaSubmission2.setId(2L);
        assertThat(fdaSubmission1).isNotEqualTo(fdaSubmission2);
        fdaSubmission1.setId(null);
        assertThat(fdaSubmission1).isNotEqualTo(fdaSubmission2);
    }
}
