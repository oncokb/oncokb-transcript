package org.mskcc.oncokb.curation.web.rest;

import java.security.Principal;
import java.util.Map;
import java.util.Optional;
import javax.servlet.http.HttpServletRequest;
import org.mskcc.oncokb.curation.config.Constants;
import org.mskcc.oncokb.curation.service.UserService;
import org.mskcc.oncokb.curation.service.dto.UserDTO;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller for managing the current user's account.
 */
@RestController
@RequestMapping("/api")
public class AccountResource {

    private static class AccountResourceException extends RuntimeException {

        private static final long serialVersionUID = 1L;

        private AccountResourceException(String message) {
            super(message);
        }
    }

    private final Logger log = LoggerFactory.getLogger(AccountResource.class);

    private final UserService userService;

    public AccountResource(UserService userService) {
        this.userService = userService;
    }

    /**
     * {@code GET  /account} : get the current user.
     *
     * @param principal the current user; resolves to {@code null} if not authenticated.
     * @return the current user.
     * @throws AccountResourceException {@code 500 (Internal Server Error)} if the user couldn't be returned.
     */
    @GetMapping("/account")
    @SuppressWarnings("unchecked")
    public UserDTO getAccount(Principal principal) {
        if (principal instanceof AbstractAuthenticationToken) {
            Optional<UserDTO> user = userService.getUserFromAuthentication((AbstractAuthenticationToken) principal);
            if (user.isPresent()) {
                return user.get();
            }
        }
        throw new AccountResourceException("User could not be found");
    }

    @GetMapping("/account/firebase-token")
    public String getFirebaseToken(Principal principal) {
        OAuth2AuthenticationToken oauth2Token = (OAuth2AuthenticationToken) principal;
        try {
            Map<String, Object> details = (Map) oauth2Token.getDetails();
            String firebaseCustomToken = (String) details.get(Constants.FIREBASE_CUSTOM_TOKEN);
            return firebaseCustomToken;
        } catch (Exception e) {
            throw new AccountResourceException("Firebase token could not be found");
        }
    }

    /**
     * {@code GET  /authenticate} : check if the user is authenticated, and return its login.
     *
     * @param request the HTTP request.
     * @return the login if the user is authenticated.
     */
    @GetMapping("/authenticate")
    public String isAuthenticated(HttpServletRequest request) {
        log.debug("REST request to check if the current user is authenticated");
        return request.getRemoteUser();
    }
}
