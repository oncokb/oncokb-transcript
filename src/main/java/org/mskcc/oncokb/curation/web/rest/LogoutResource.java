package org.mskcc.oncokb.curation.web.rest;

import java.util.Map;
import javax.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing global OIDC logout.
 */
@RestController
public class LogoutResource {

    private final ClientRegistration registration;

    public LogoutResource(ClientRegistrationRepository registrations) {
        this.registration = registrations.findByRegistrationId("oidc");
    }

    /**
     * {@code POST  /api/logout} : logout the current user.
     *
     * @param request the {@link HttpServletRequest}.
     * @param idToken the ID token.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and a body with a global logout URL.
     */
    @PostMapping("/api/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        StringBuilder logoutUrl = new StringBuilder();

        // Get keycloak logout endpoint (host/auth/realms/<my_realm>/protocol/openid-connect/logout)
        logoutUrl.append(this.registration.getProviderDetails().getConfigurationMetadata().get("end_session_endpoint").toString());

        String originUrl = request.getHeader(HttpHeaders.ORIGIN);

        OAuth2AuthenticationToken auth = (OAuth2AuthenticationToken) SecurityContextHolder.getContext().getAuthentication();
        OidcUser oAuth2User = (OidcUser) auth.getPrincipal();
        String idTokenHint = oAuth2User.getIdToken().getTokenValue();

        // After logout redirect to home page
        logoutUrl.append("?post_logout_redirect_uri=").append(originUrl);
        logoutUrl.append("&id_token_hint=").append(idTokenHint);

        request.getSession().invalidate();
        return ResponseEntity.ok().body(Map.of("logoutUrl", logoutUrl.toString()));
    }
}
