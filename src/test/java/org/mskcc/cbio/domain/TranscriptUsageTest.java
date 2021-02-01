package org.mskcc.cbio.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.cbio.web.rest.TestUtil;

class TranscriptUsageTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(TranscriptUsage.class);
        TranscriptUsage transcriptUsage1 = new TranscriptUsage();
        transcriptUsage1.setId(1L);
        TranscriptUsage transcriptUsage2 = new TranscriptUsage();
        transcriptUsage2.setId(transcriptUsage1.getId());
        assertThat(transcriptUsage1).isEqualTo(transcriptUsage2);
        transcriptUsage2.setId(2L);
        assertThat(transcriptUsage1).isNotEqualTo(transcriptUsage2);
        transcriptUsage1.setId(null);
        assertThat(transcriptUsage1).isNotEqualTo(transcriptUsage2);
    }
}
