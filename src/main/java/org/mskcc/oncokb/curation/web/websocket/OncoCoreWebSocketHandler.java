package org.mskcc.oncokb.curation.web.websocket;

import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

// https://docs.spring.io/spring-framework/docs/4.3.x/spring-framework-reference/html/websocket.html
// https://www.javainuse.com/spring/boot-websocket

public class OncoCoreWebSocketHandler extends TextWebSocketHandler {

    private final Logger log = LoggerFactory.getLogger(ProxyCurationValidationApiHandler.class);
    private final WebSocketSession uiSession;
    private WebSocketSession coreSession;

    public OncoCoreWebSocketHandler(WebSocketSession uiSession) {
        super();
        this.uiSession = uiSession;
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws IOException {
        try {
            this.log.debug("Received message: " + message);
            this.sendText(message);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sendText(TextMessage message) {
        try {
            this.uiSession.sendMessage(message);
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        this.coreSession = session;
    }

    public void closeCoreSession() throws Exception {
        if (this.coreSession != null) {
            this.coreSession.close();
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) throws Exception {
        try {
            super.afterConnectionClosed(session, status);
            this.uiSession.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}
