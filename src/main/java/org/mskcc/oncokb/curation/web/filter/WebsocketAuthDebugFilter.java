package org.mskcc.oncokb.curation.web.filter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.Arrays;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

public class WebsocketAuthDebugFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(WebsocketAuthDebugFilter.class);

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
        throws ServletException, IOException {
        String path = request.getRequestURI();
        if (path != null && path.startsWith("/websocket")) {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            String authName = auth != null ? auth.getName() : "null";
            String authType = auth != null ? auth.getClass().getSimpleName() : "null";
            boolean isAuthenticated = auth != null && auth.isAuthenticated();
            String authorities = auth == null
                ? "[]"
                : auth.getAuthorities().stream().map(a -> a.getAuthority()).sorted().collect(Collectors.joining(",", "[", "]"));

            String cookieHeader = request.getHeader("Cookie");
            boolean hasCookieHeader = cookieHeader != null && !cookieHeader.isBlank();
            String jsessionId = extractJsessionId(cookieHeader).orElse("none");

            String forwardedProto = request.getHeader("X-Forwarded-Proto");
            String forwarded = request.getHeader("Forwarded");

            log.info(
                "WS auth debug: path={}, hasCookie={}, jsessionId={}, authName={}, authType={}, isAuthenticated={}, authorities={}, xForwardedProto={}, forwarded={}",
                path,
                hasCookieHeader,
                mask(jsessionId),
                authName,
                authType,
                isAuthenticated,
                authorities,
                forwardedProto,
                forwarded
            );
        }
        filterChain.doFilter(request, response);
    }

    private Optional<String> extractJsessionId(String cookieHeader) {
        if (cookieHeader == null || cookieHeader.isBlank()) {
            return Optional.empty();
        }
        return Arrays.stream(cookieHeader.split(";"))
            .map(String::trim)
            .filter(part -> part.startsWith("JSESSIONID="))
            .map(part -> part.substring("JSESSIONID=".length()))
            .findFirst();
    }

    private String mask(String value) {
        if (value == null || value.isBlank()) {
            return "none";
        }
        if (value.length() <= 8) {
            return "****";
        }
        return "****" + value.substring(value.length() - 4);
    }
}
