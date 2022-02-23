package org.mskcc.oncokb.transcript.security;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import org.mskcc.oncokb.transcript.domain.User;
import org.mskcc.oncokb.transcript.repository.UserRepository;
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

    @Autowired
    private UserRepository userRepository;

    private RedirectStrategy redirectStrategy = new DefaultRedirectStrategy();

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication)
        throws IOException, ServletException {
        Map<String, Object> attributes = ((OAuth2AuthenticationToken) authentication).getPrincipal().getAttributes();
        String email = (String) attributes.get("email");
        Optional<User> user = userRepository.findOneByEmailIgnoreCase(email);

        // If user exists, then let spring security handle
        if (user.isPresent()) {
            super.onAuthenticationSuccess(request, response, authentication);
        } else {
            request.getSession().invalidate();
            SecurityContextHolder.clearContext();
            redirectStrategy.sendRedirect(request, response, "/logout");
        }
        clearAuthenticationAttributes(request);
    }
}
