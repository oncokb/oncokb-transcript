package org.mskcc.oncokb.curation.security;

import com.google.gson.Gson;
import java.io.IOException;
import java.util.Map;
import java.util.Optional;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.mskcc.oncokb.curation.domain.User;
import org.mskcc.oncokb.curation.repository.UserRepository;
import org.mskcc.oncokb.curation.service.dto.KeycloakUserDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
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
            super.onAuthenticationSuccess(request, response, authentication);
        } else {
            request.getSession().invalidate();
            SecurityContextHolder.clearContext();
            redirectStrategy.sendRedirect(request, response, "/logout");
        }
        clearAuthenticationAttributes(request);
    }
}
