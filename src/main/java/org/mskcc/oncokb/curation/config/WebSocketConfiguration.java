package org.mskcc.oncokb.curation.config;

import java.util.List;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.mskcc.oncokb.curation.web.websocket.ProxyWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
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

    // @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        var handler = registry.addHandler(new ProxyWebSocketHandler(this.applicationProperties), "/websocket/**");

        List<String> allowedOriginPatterns = jHipsterProperties.getCors().getAllowedOriginPatterns();
        if (allowedOriginPatterns != null && !allowedOriginPatterns.isEmpty()) {
            handler.setAllowedOriginPatterns(allowedOriginPatterns.toArray(new String[0]));
            return;
        }

        List<String> allowOrigins = jHipsterProperties.getCors().getAllowedOrigins();
        if (allowOrigins != null && !allowOrigins.isEmpty()) {
            handler.setAllowedOrigins(allowOrigins.toArray(new String[0]));
        }
    }
}
