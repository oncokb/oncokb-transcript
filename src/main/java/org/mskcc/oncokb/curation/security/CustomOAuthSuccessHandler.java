package org.mskcc.oncokb.curation.security;

import com.google.firebase.auth.FirebaseAuth;
import com.google.gson.Gson;
import java.io.IOException;
import java.util.Collection;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.mskcc.oncokb.curation.config.Constants;
import org.mskcc.oncokb.curation.config.application.ApplicationProperties;
import org.mskcc.oncokb.curation.service.UserService;
import org.mskcc.oncokb.curation.service.dto.KeycloakUserDTO;
import org.mskcc.oncokb.curation.service.dto.UserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.DefaultOidcUser;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class CustomOAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    @Autowired
    private UserService userService;

    @Autowired
    private ApplicationProperties applicationProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
        throws IOException, ServletException {
        Map<String, Object> attributes = ((OAuth2AuthenticationToken) authentication).getPrincipal().getAttributes();
        Gson gson = new Gson();
        String json = gson.toJson(attributes);
        KeycloakUserDTO keycloakUser = gson.fromJson(json, KeycloakUserDTO.class);

        Optional<UserDTO> optionalUser = userService.findOneByEmailIgnoreCase(keycloakUser.getEmail());
        // If user is in db, then let spring security handle authentication success.
        // When we use the OncoKB public user table, then an activated user is not neccesarily
        // allowed to access this service. We will need to add a ROLE_CURATOR role to public
        // and check that the role exists here.
        if (optionalUser.isPresent() && optionalUser.get().isActivated() && !optionalUser.get().getAuthorities().isEmpty()) {
            UserDTO user = optionalUser.get();
            if (keycloakUser.getImageUrl() != null) {
                user.setImageUrl(keycloakUser.getImageUrl());
                userService.updateUser(user);
            }

            // Keycloak oauth token uses `sub` to get principal name which is a unique id.
            // We like to use the `name` field instead, so it can be used to store in the audit.
            OAuth2AuthenticationToken authenticationWithAuthorities = getOAuth2AuthenticationToken(
                (OAuth2AuthenticationToken) authentication,
                user
            );

            if (applicationProperties.getFirebase().isEnabled()) {
                addFirebaseTokenToAuthToken(authenticationWithAuthorities);
            }

            SecurityContextHolder.getContext().setAuthentication(authenticationWithAuthorities);
            super.onAuthenticationSuccess(request, response, authenticationWithAuthorities);
        } else {
            redirectStrategy.sendRedirect(request, response, "/logout?unauthorized=true");
        }

        clearAuthenticationAttributes(request);
    }

    private static OAuth2AuthenticationToken getOAuth2AuthenticationToken(OAuth2AuthenticationToken authentication, UserDTO user) {
        Collection<? extends GrantedAuthority> authorities = user
            .getAuthorities()
            .stream()
            .map(SimpleGrantedAuthority::new)
            .collect(Collectors.toList());

        OidcUser oAuth2User = (OidcUser) authentication.getPrincipal();

        OAuth2AuthenticationToken authenticationWithAuthorities = new OAuth2AuthenticationToken(
            new DefaultOidcUser(oAuth2User.getAuthorities(), oAuth2User.getIdToken(), "sub"),
            authorities,
            authentication.getAuthorizedClientRegistrationId()
        );
        return authenticationWithAuthorities;
    }

    private void addFirebaseTokenToAuthToken(OAuth2AuthenticationToken authenticationWithAuthorities) {
        // Create a custom token for frontend Firebase authentication if user has ROLE_CURATOR role
        if (SecurityUtils.hasAuthenticationAnyOfAuthorities(authenticationWithAuthorities, AuthoritiesConstants.CURATOR)) {
            String email = authenticationWithAuthorities.getPrincipal().getAttribute("email");
            String firebaseCustomToken = null;
            try {
                Map<String, Object> additionalClaims = new HashMap<>();
                // This claim will be used in Firebase security rules for authorization.
                additionalClaims.put(Constants.FIREBASE_AUTHORIZED_CLAIM, true);
                firebaseCustomToken = FirebaseAuth.getInstance().createCustomTokenAsync(email, additionalClaims).get();
            } catch (InterruptedException | ExecutionException e) {
                logger.error("Could not create Firebase custom token", e);
            }
            // Add additionalDetails containing firebase token to Authentication object
            if (firebaseCustomToken != null) {
                Map<String, Object> additionalDetails = new HashMap<>();
                additionalDetails.put(Constants.FIREBASE_CUSTOM_TOKEN, firebaseCustomToken);
                authenticationWithAuthorities.setDetails(additionalDetails);
            }
        }
    }
}
