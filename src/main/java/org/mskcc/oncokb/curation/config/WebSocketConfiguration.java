package org.mskcc.oncokb.curation.config;

import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.mskcc.oncokb.curation.web.websocket.ProxyCurationValidationApiHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;
import tech.jhipster.config.JHipsterProperties;

@Configuration
@EnableWebSocket
public class WebSocketConfiguration implements WebSocketConfigurer {

    private JHipsterProperties jHipsterProperties;
    private ApplicationProperties applicationProperties;

    @Autowired
    public void setJHipsterProperties(JHipsterProperties jHipsterProperties) {
        this.jHipsterProperties = jHipsterProperties;
    }

    @Autowired
    public void setJHipsterProperties(ApplicationProperties applicationProperties) {
        this.applicationProperties = applicationProperties;
    }

    //@Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        CorsConfiguration config = jHipsterProperties.getCors();
        registry
            .addHandler(new ProxyCurationValidationApiHandler(this.applicationProperties), "/api/websocket/curation/validation")
            .setAllowedOrigins(config.getAllowedOrigins().toArray(new String[0]));
    }
}
