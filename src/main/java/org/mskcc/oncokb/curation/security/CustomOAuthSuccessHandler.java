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
import org.mskcc.oncokb.curation.domain.User;
import org.mskcc.oncokb.curation.repository.UserRepository;
import org.mskcc.oncokb.curation.service.dto.KeycloakUserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.DefaultRedirectStrategy;
import org.springframework.security.web.RedirectStrategy;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

@Component
public class CustomOAuthSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ApplicationProperties applicationProperties;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
        throws IOException, ServletException {
        Map<String, Object> attributes = ((OAuth2AuthenticationToken) authentication).getPrincipal().getAttributes();
        Gson gson = new Gson();
        String json = gson.toJson(attributes);
        KeycloakUserDTO keycloakUser = gson.fromJson(json, KeycloakUserDTO.class);

        Optional<User> user = userRepository.findOneByEmailIgnoreCase(keycloakUser.getEmail());
        // If user is in db, then let spring security handle authentication success.
        // When we use the OncoKB public user table, then an activated user is not neccesarily
        // allowed to access this service. We will need to add a ROLE_CURATOR role to public
        // and check that the role exists here.
        if (user.isPresent() && user.get().isActivated()) {
            Collection<? extends GrantedAuthority> authorities = user
                .get()
                .getAuthorities()
                .stream()
                .map(auth -> auth.getName())
                .map(SimpleGrantedAuthority::new)
                .collect(Collectors.toList());
            OAuth2AuthenticationToken authenticationWithAuthorities = new OAuth2AuthenticationToken(
                ((OAuth2AuthenticationToken) authentication).getPrincipal(),
                authorities,
                ((OAuth2AuthenticationToken) authentication).getAuthorizedClientRegistrationId()
            );

            if (applicationProperties.getFirebase().isEnabled()) {
                addFirebaseTokenToAuthToken(authenticationWithAuthorities);
            }

            SecurityContextHolder.getContext().setAuthentication(authenticationWithAuthorities);
            super.onAuthenticationSuccess(request, response, authenticationWithAuthorities);
        } else {
            request.getSession().invalidate();
            SecurityContextHolder.clearContext();
            redirectStrategy.sendRedirect(request, response, "/logout");
        }

        clearAuthenticationAttributes(request);
    }

    private void addFirebaseTokenToAuthToken(OAuth2AuthenticationToken authenticationWithAuthorities) {
        // Create a custom token for frontend Firebase authentication if user has ROLE_FIREBASE role
        if (SecurityUtils.hasAuthenticationAnyOfAuthorities(authenticationWithAuthorities, AuthoritiesConstants.FIREBASE)) {
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
