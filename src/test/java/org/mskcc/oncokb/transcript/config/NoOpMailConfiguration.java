package org.mskcc.oncokb.transcript.config;

import static org.mockito.Mockito.mock;

import org.mskcc.oncokb.transcript.service.MailService;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class NoOpMailConfiguration {

    private final MailService mockMailService;

    public NoOpMailConfiguration() {
        mockMailService = mock(MailService.class);
    }

    @Bean
    public MailService mailService() {
        return mockMailService;
    }
}
