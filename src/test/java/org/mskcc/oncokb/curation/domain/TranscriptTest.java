package org.mskcc.oncokb.curation.domain;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.mskcc.oncokb.curation.web.rest.TestUtil;

class TranscriptTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Transcript.class);
        Transcript transcript1 = new Transcript();
        transcript1.setId(1L);
        Transcript transcript2 = new Transcript();
        transcript2.setId(transcript1.getId());
        assertThat(transcript1).isEqualTo(transcript2);
        transcript2.setId(2L);
        assertThat(transcript1).isNotEqualTo(transcript2);
        transcript1.setId(null);
        assertThat(transcript1).isNotEqualTo(transcript2);
    }
}
