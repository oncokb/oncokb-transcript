package org.mskcc.oncokb.curation.config.security;

import static org.springframework.security.config.Customizer.withDefaults;

import org.mskcc.oncokb.curation.security.jwt.JWTConfigurer;
import org.mskcc.oncokb.curation.security.jwt.JWTFilter;
import org.mskcc.oncokb.curation.security.jwt.TokenProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.server.resource.web.BearerTokenAuthenticationEntryPoint;
import org.springframework.security.oauth2.server.resource.web.access.BearerTokenAccessDeniedHandler;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.security.web.util.matcher.RequestHeaderRequestMatcher;
import tech.jhipster.config.JHipsterProperties;

/**
 * We use OAuth2 authentication for the frontend. We also have oncokb-core that needs
 * to make API requests to this application, so we also need to support JWT token authentication.
 * In order to use multiple WebSecurityConfigurerAdapter, we need to use requestMatcher() to
 * let spring know which SecurityConfiguration to use. Our requestMatcher() condition is that any request
 * with an 'Authorization' header will use SecurityConfigurationJWT, while others will use SecurityConfigurationOAuth.
 */

@Order(1)
@Configuration
@EnableWebSecurity
@EnableGlobalMethodSecurity(prePostEnabled = true, securedEnabled = true)
public class SecurityConfigurationJWT {

    private static final Logger log = LoggerFactory.getLogger(SecurityConfigurationJWT.class);

    private final JHipsterProperties jHipsterProperties;
    private final TokenProvider tokenProvider;

    public SecurityConfigurationJWT(TokenProvider tokenProvider, JHipsterProperties jHipsterProperties) {
        this.tokenProvider = tokenProvider;
        this.jHipsterProperties = jHipsterProperties;
    }

    @Bean
    public SecurityFilterChain jwtFilterChain(HttpSecurity http, MvcRequestMatcher.Builder mvc) throws Exception {
        http
            .securityMatcher(new RequestHeaderRequestMatcher(JWTFilter.AUTHORIZATION_HEADER))
            .cors(withDefaults())
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authz -> authz.requestMatchers(mvc.pattern("/api/**")).authenticated())
            .headers(
                headers ->
                    headers
                        .contentSecurityPolicy(csp -> csp.policyDirectives(jHipsterProperties.getSecurity().getContentSecurityPolicy()))
                        .frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                        .referrerPolicy(
                            referrer -> referrer.policy(ReferrerPolicyHeaderWriter.ReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN)
                        )
                        .permissionsPolicy(
                            permissions ->
                                permissions.policy(
                                    "camera=(), fullscreen=(self), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), sync-xhr=()"
                                )
                        )
            )
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(
                exceptions ->
                    exceptions
                        .authenticationEntryPoint(new BearerTokenAuthenticationEntryPoint())
                        .accessDeniedHandler(new BearerTokenAccessDeniedHandler())
            )
            .with(securityConfigurerAdapter(), withDefaults());
        return http.build();
    }

    private JWTConfigurer securityConfigurerAdapter() {
        return new JWTConfigurer(tokenProvider);
    }
}
