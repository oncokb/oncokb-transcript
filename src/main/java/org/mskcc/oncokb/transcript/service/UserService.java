package org.mskcc.oncokb.transcript.service;

import com.google.gson.Gson;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;
import org.mskcc.oncokb.transcript.config.Constants;
import org.mskcc.oncokb.transcript.domain.Authority;
import org.mskcc.oncokb.transcript.domain.User;
import org.mskcc.oncokb.transcript.repository.AuthorityRepository;
import org.mskcc.oncokb.transcript.repository.UserRepository;
import org.mskcc.oncokb.transcript.security.SecurityUtils;
import org.mskcc.oncokb.transcript.service.dto.KeycloakUserDTO;
import org.mskcc.oncokb.transcript.service.dto.UserDTO;
import org.mskcc.oncokb.transcript.service.mapper.UserMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service class for managing users.
 */
@Service
@Transactional
public class UserService {

    private final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;

    private final AuthorityRepository authorityRepository;

    private final UserMapper userMapper;

    public UserService(UserRepository userRepository, AuthorityRepository authorityRepository, UserMapper userMapper) {
        this.userRepository = userRepository;
        this.authorityRepository = authorityRepository;
        this.userMapper = userMapper;
    }

    /**
     * Update basic information (first name, last name, email, language) for the current user.
     *
     * @param firstName first name of user.
     * @param lastName  last name of user.
     * @param email     email id of user.
     * @param langKey   language key.
     * @param imageUrl  image URL of user.
     */
    public void updateUser(String firstName, String lastName, String email, String langKey, String imageUrl) {
        SecurityUtils
            .getCurrentUserLogin()
            .flatMap(userRepository::findOneByLogin)
            .ifPresent(user -> {
                user.setFirstName(firstName);
                user.setLastName(lastName);
                if (email != null) {
                    user.setEmail(email.toLowerCase());
                }
                user.setLangKey(langKey);
                user.setImageUrl(imageUrl);
                this.clearUserCaches(user);
                log.debug("Changed Information for User: {}", user);
            });
    }

    @Transactional(readOnly = true)
    public Page<UserDTO> getAllManagedUsers(Pageable pageable) {
        return userRepository.findAll(pageable).map(UserDTO::new);
    }

    @Transactional(readOnly = true)
    public Optional<User> getUserWithAuthoritiesByLogin(String login) {
        return userRepository.findOneWithAuthoritiesByLogin(login);
    }

    /**
     * Gets a list of all the authorities.
     * @return a list of all the authorities.
     */
    @Transactional(readOnly = true)
    public List<String> getAuthorities() {
        return authorityRepository.findAll().stream().map(Authority::getName).collect(Collectors.toList());
    }

    /**
     * Returns the user from an OAuth 2.0 login or jwt token.
     *
     * @param authToken the authentication token.
     * @return the user from the authentication.
     */
    @Transactional
    public Optional<UserDTO> getUserFromAuthentication(AbstractAuthenticationToken authToken) {
        if (authToken instanceof UsernamePasswordAuthenticationToken) { // Our custom JWT
            Optional<User> user = userRepository.findOneByLogin(authToken.getName());
            if (user.isPresent()) {
                return Optional.of(userMapper.userToUserDTO(user.get()));
            }
            return Optional.empty();
        }

        Map<String, Object> attributes;
        if (authToken instanceof OAuth2AuthenticationToken) { // Spring oauth2
            attributes = ((OAuth2AuthenticationToken) authToken).getPrincipal().getAttributes();
        } else {
            throw new IllegalArgumentException("AuthenticationToken is not OAuth2 or JWT!");
        }

        Gson gson = new Gson();
        String json = gson.toJson(attributes);
        KeycloakUserDTO keycloakUser = gson.fromJson(json, KeycloakUserDTO.class);
        Optional<User> user = userRepository.findOneByEmailIgnoreCase(keycloakUser.getEmail());
        if (user.isPresent()) {
            return Optional.of(userMapper.userToUserDTO(user.get()));
        }
        return Optional.empty();
    }

    /**
     * Extracts the authorities from the authentication token
     * @param authToken the authentication token
     * @return set of authorities
     */
    private static Set<Authority> getAuthoritiesFromAuthToken(AbstractAuthenticationToken authToken) {
        return authToken
            .getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .map(authority -> {
                Authority auth = new Authority();
                auth.setName(authority);
                return auth;
            })
            .collect(Collectors.toSet());
    }

    private void clearUserCaches(User user) {}
}
