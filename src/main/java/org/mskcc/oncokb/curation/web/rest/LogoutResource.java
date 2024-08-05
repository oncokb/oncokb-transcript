package org.mskcc.oncokb.curation.web.rest;

import jakarta.servlet.http.HttpServletRequest;
import java.util.Map;
import org.mskcc.oncokb.curation.security.SecurityUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
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
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and a body with a global logout URL.
     */
    @PostMapping("/api/logout")
    public ResponseEntity<?> logout(HttpServletRequest request) {
        String logoutUrl = SecurityUtils.getKeycloakLogoutURL(this.registration);
        request.getSession().invalidate();
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok().body(Map.of("logoutUrl", logoutUrl));
    }
}
