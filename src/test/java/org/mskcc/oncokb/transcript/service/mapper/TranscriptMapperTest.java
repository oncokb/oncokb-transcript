package org.mskcc.oncokb.transcript.service.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class TranscriptMapperTest {

    private TranscriptMapper transcriptMapper;

    @BeforeEach
    public void setUp() {
        transcriptMapper = new TranscriptMapperImpl();
    }
}
