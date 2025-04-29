package org.mskcc.oncokb.curation.config.security;

import static org.springframework.security.config.Customizer.withDefaults;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.*;
import java.util.function.Supplier;
import org.mskcc.oncokb.curation.security.*;
import org.mskcc.oncokb.curation.web.filter.SpaWebFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.oauth2.core.oidc.user.OidcUserAuthority;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.www.BasicAuthenticationFilter;
import org.springframework.security.web.csrf.*;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;
import org.springframework.security.web.servlet.util.matcher.MvcRequestMatcher;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.handler.HandlerMappingIntrospector;
import tech.jhipster.config.JHipsterProperties;
import tech.jhipster.web.filter.CookieCsrfFilter;

@Order(2)
@Configuration
@EnableWebSecurity
public class SecurityConfigurationOAuth {

    private final JHipsterProperties jHipsterProperties;

    private final CorsFilter corsFilter;

    @Value("${spring.security.oauth2.client.provider.oidc.issuer-uri}")
    private String issuerUri;

    public SecurityConfigurationOAuth(CorsFilter corsFilter, JHipsterProperties jHipsterProperties) {
        this.corsFilter = corsFilter;
        this.jHipsterProperties = jHipsterProperties;
    }

    @Bean
    public SecurityFilterChain oauthFilterChain(HttpSecurity http, MvcRequestMatcher.Builder mvc) throws Exception {
        // @formatter:off
        http
            .cors(withDefaults())
            .csrf(
                csrf ->
                    csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new SpaCsrfTokenRequestHandler())
            )
            .addFilterAfter(new SpaWebFilter(), BasicAuthenticationFilter.class)
            .addFilterAfter(new CookieCsrfFilter(), BasicAuthenticationFilter.class)
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
            .authorizeHttpRequests(
                authz ->
                    // prettier-ignore
                authz
                    .requestMatchers(mvc.pattern("/index.html"), mvc.pattern("/*.js"), mvc.pattern("/*.txt"), mvc.pattern("/*.json"), mvc.pattern("/*.map"), mvc.pattern("/*.css")).permitAll()
                    .requestMatchers(mvc.pattern("/*.ico"), mvc.pattern("/*.png"), mvc.pattern("/*.svg"), mvc.pattern("/*.webapp")).permitAll()
                    .requestMatchers(mvc.pattern("/app/**")).permitAll()
                    .requestMatchers(mvc.pattern("/i18n/**")).permitAll()
                    .requestMatchers(mvc.pattern("/content/**")).permitAll()
                    .requestMatchers(mvc.pattern("/swagger-ui/**")).permitAll()
                    .requestMatchers(mvc.pattern("/api/authenticate")).permitAll()
                    .requestMatchers(mvc.pattern("/api/auth-info")).permitAll()
                    .requestMatchers(mvc.pattern("/api/logout")).permitAll()
                    .requestMatchers(mvc.pattern("/api/admin/**")).hasAuthority(AuthoritiesConstants.ADMIN)
                    .requestMatchers(mvc.pattern("/api/audit/**")).hasAuthority(AuthoritiesConstants.ADMIN)
                    .requestMatchers(mvc.pattern("/api/account/firebase-token")).hasAnyAuthority(AuthoritiesConstants.CURATOR, AuthoritiesConstants.USER)
                    .requestMatchers(mvc.pattern("/websocket/**")).hasAnyAuthority(AuthoritiesConstants.CURATOR, AuthoritiesConstants.USER)
                    .requestMatchers(mvc.pattern("/api/**")).hasAnyAuthority(AuthoritiesConstants.CURATOR, AuthoritiesConstants.USER, AuthoritiesConstants.ADMIN)
                    .requestMatchers(mvc.pattern("/legacy-api/**")).hasAnyAuthority(AuthoritiesConstants.CURATOR, AuthoritiesConstants.USER, AuthoritiesConstants.ADMIN)
                    .requestMatchers(mvc.pattern("/core/**")).hasAnyAuthority(AuthoritiesConstants.CURATOR, AuthoritiesConstants.USER, AuthoritiesConstants.ADMIN)
                    .requestMatchers(mvc.pattern("/v3/api-docs/**")).hasAuthority(AuthoritiesConstants.ADMIN)
                    .requestMatchers(mvc.pattern("/management/**")).hasAuthority(AuthoritiesConstants.ADMIN)
            )
            .oauth2Login(oauth2 -> oauth2.loginPage("/oauth2/authorization/oidc").successHandler(customOAuthSuccessHandler()))
            .oauth2Client(withDefaults());
        return http.build();
    }

    @Bean
    MvcRequestMatcher.Builder mvc(HandlerMappingIntrospector introspector) {
        return new MvcRequestMatcher.Builder(introspector);
    }

    @Bean
    public CustomOAuthSuccessHandler customOAuthSuccessHandler() {
        return new CustomOAuthSuccessHandler();
    }

    /**
     * Map authorities from "groups" or "roles" claim in ID Token.
     *
     * @return a {@link GrantedAuthoritiesMapper} that maps groups from
     * the IdP to Spring Security Authorities.
     */
    @Bean
    public GrantedAuthoritiesMapper userAuthoritiesMapper() {
        return authorities -> {
            Set<GrantedAuthority> mappedAuthorities = new HashSet<>();

            authorities.forEach(authority -> {
                // Check for OidcUserAuthority because Spring Security 5.2 returns
                // each scope as a GrantedAuthority, which we don't care about.
                if (authority instanceof OidcUserAuthority oidcUserAuthority) {
                    mappedAuthorities.addAll(SecurityUtils.extractAuthorityFromClaims(oidcUserAuthority.getUserInfo().getClaims()));
                }else if (authority instanceof SimpleGrantedAuthority simpleGrantedAuthority) {
                    mappedAuthorities.add(simpleGrantedAuthority);
                }
            });
            return mappedAuthorities;
        };
    }

    /**
     * Custom CSRF handler to provide BREACH protection.
     *
     * @see <a href="https://docs.spring.io/spring-security/reference/servlet/exploits/csrf.html#csrf-integration-javascript-spa">Spring Security Documentation - Integrating with CSRF Protection</a>
     * @see <a href="https://github.com/jhipster/generator-jhipster/pull/25907">JHipster - use customized SpaCsrfTokenRequestHandler to handle CSRF token</a>
     * @see <a href="https://stackoverflow.com/q/74447118/65681">CSRF protection not working with Spring Security 6</a>
     */
    static final class SpaCsrfTokenRequestHandler extends CsrfTokenRequestAttributeHandler {

        private final CsrfTokenRequestHandler delegate = new XorCsrfTokenRequestAttributeHandler();

        @Override
        public void handle(HttpServletRequest request, HttpServletResponse response, Supplier<CsrfToken> csrfToken) {
            /*
             * Always use XorCsrfTokenRequestAttributeHandler to provide BREACH protection of
             * the CsrfToken when it is rendered in the response body.
             */
            this.delegate.handle(request, response, csrfToken);
        }

        @Override
        public String resolveCsrfTokenValue(HttpServletRequest request, CsrfToken csrfToken) {
            /*
             * If the request contains a request header, use CsrfTokenRequestAttributeHandler
             * to resolve the CsrfToken. This applies when a single-page application includes
             * the header value automatically, which was obtained via a cookie containing the
             * raw CsrfToken.
             */
            if (StringUtils.hasText(request.getHeader(csrfToken.getHeaderName()))) {
                return super.resolveCsrfTokenValue(request, csrfToken);
            }
            /*
             * In all other cases (e.g. if the request contains a request parameter), use
             * XorCsrfTokenRequestAttributeHandler to resolve the CsrfToken. This applies
             * when a server-side rendered form includes the _csrf request parameter as a
             * hidden input.
             */
            return this.delegate.resolveCsrfTokenValue(request, csrfToken);
        }
    }
}
