package org.mskcc.oncokb.curation.web.websocket;

import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.WebSocketMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.client.standard.StandardWebSocketClient;

// https://docs.spring.io/spring-framework/docs/4.3.x/spring-framework-reference/html/websocket.html
// https://www.javainuse.com/spring/boot-websocket

public class ProxyCurationValidationApiHandler implements WebSocketHandler {

    private OncoCoreWebSocketHandler oncoHandler;
    private String validationEndpoint;

    public ProxyCurationValidationApiHandler(ApplicationProperties applicationProperties) {
        String url = applicationProperties.getOncokbCore().getUrl();
        url = url.replace("https://", "wss://");
        url = url.replace("http://", "ws://");
        this.validationEndpoint = url + "/api/websocket/curation/validation";
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        try {
            StandardWebSocketClient client = new StandardWebSocketClient();
            OncoCoreWebSocketHandler handler = new OncoCoreWebSocketHandler(session);
            client.doHandshake(handler, this.validationEndpoint);
            this.oncoHandler = handler;
        } catch (Exception e) {
            e.printStackTrace();
            session.close(CloseStatus.SERVER_ERROR.withReason("Failed to connect to core"));
        }
    }

    @Override
    public void handleMessage(WebSocketSession session, WebSocketMessage<?> message) throws Exception {
        session.close(CloseStatus.NOT_ACCEPTABLE.withReason("All messages are not supported"));
    }

    @Override
    public void handleTransportError(WebSocketSession session, Throwable exception) throws Exception {}

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus closeStatus) throws Exception {
        this.oncoHandler.closeCoreSession();
    }

    @Override
    public boolean supportsPartialMessages() {
        return false;
    }
}
