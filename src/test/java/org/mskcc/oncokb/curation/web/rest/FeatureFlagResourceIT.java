package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import jakarta.persistence.EntityManager;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.Alteration;
import org.mskcc.oncokb.curation.domain.FeatureFlag;
import org.mskcc.oncokb.curation.domain.User;
import org.mskcc.oncokb.curation.repository.FeatureFlagRepository;
import org.mskcc.oncokb.curation.service.FeatureFlagService;
import org.mskcc.oncokb.curation.service.criteria.FeatureFlagCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link FeatureFlagResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class FeatureFlagResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final Boolean DEFAULT_ENABLED = false;
    private static final Boolean UPDATED_ENABLED = true;

    private static final String ENTITY_API_URL = "/api/feature-flags";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private FeatureFlagRepository featureFlagRepository;

    @Mock
    private FeatureFlagRepository featureFlagRepositoryMock;

    @Mock
    private FeatureFlagService featureFlagServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restFeatureFlagMockMvc;

    private FeatureFlag featureFlag;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FeatureFlag createEntity(EntityManager em) {
        FeatureFlag featureFlag = new FeatureFlag().name(DEFAULT_NAME).description(DEFAULT_DESCRIPTION).enabled(DEFAULT_ENABLED);
        return featureFlag;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FeatureFlag createUpdatedEntity(EntityManager em) {
        FeatureFlag featureFlag = new FeatureFlag().name(UPDATED_NAME).description(UPDATED_DESCRIPTION).enabled(UPDATED_ENABLED);
        return featureFlag;
    }

    @BeforeEach
    public void initTest() {
        featureFlag = createEntity(em);
    }

    @Test
    @Transactional
    void createFeatureFlag() throws Exception {
        int databaseSizeBeforeCreate = featureFlagRepository.findAll().size();
        // Create the FeatureFlag
        restFeatureFlagMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(featureFlag))
            )
            .andExpect(status().isCreated());

        // Validate the FeatureFlag in the database
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeCreate + 1);
        FeatureFlag testFeatureFlag = featureFlagList.get(featureFlagList.size() - 1);
        assertThat(testFeatureFlag.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testFeatureFlag.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testFeatureFlag.getEnabled()).isEqualTo(DEFAULT_ENABLED);
    }

    @Test
    @Transactional
    void createFeatureFlagWithExistingId() throws Exception {
        // Create the FeatureFlag with an existing ID
        featureFlag.setId(1L);

        int databaseSizeBeforeCreate = featureFlagRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restFeatureFlagMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(featureFlag))
            )
            .andExpect(status().isBadRequest());

        // Validate the FeatureFlag in the database
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = featureFlagRepository.findAll().size();
        // set the field null
        featureFlag.setName(null);

        // Create the FeatureFlag, which fails.

        restFeatureFlagMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(featureFlag))
            )
            .andExpect(status().isBadRequest());

        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllFeatureFlags() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList
        restFeatureFlagMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(featureFlag.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].enabled").value(hasItem(DEFAULT_ENABLED.booleanValue())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllFeatureFlagsWithEagerRelationshipsIsEnabled() throws Exception {
        when(featureFlagServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restFeatureFlagMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(featureFlagServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllFeatureFlagsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(featureFlagServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restFeatureFlagMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(featureFlagServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getFeatureFlag() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get the featureFlag
        restFeatureFlagMockMvc
            .perform(get(ENTITY_API_URL_ID, featureFlag.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(featureFlag.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.enabled").value(DEFAULT_ENABLED.booleanValue()));
    }

    @Test
    @Transactional
    void getFeatureFlagsByIdFiltering() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        Long id = featureFlag.getId();

        defaultFeatureFlagShouldBeFound("id.equals=" + id);
        defaultFeatureFlagShouldNotBeFound("id.notEquals=" + id);

        defaultFeatureFlagShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultFeatureFlagShouldNotBeFound("id.greaterThan=" + id);

        defaultFeatureFlagShouldBeFound("id.lessThanOrEqual=" + id);
        defaultFeatureFlagShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where name equals to DEFAULT_NAME
        defaultFeatureFlagShouldBeFound("name.equals=" + DEFAULT_NAME);

        // Get all the featureFlagList where name equals to UPDATED_NAME
        defaultFeatureFlagShouldNotBeFound("name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where name not equals to DEFAULT_NAME
        defaultFeatureFlagShouldNotBeFound("name.notEquals=" + DEFAULT_NAME);

        // Get all the featureFlagList where name not equals to UPDATED_NAME
        defaultFeatureFlagShouldBeFound("name.notEquals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where name in DEFAULT_NAME or UPDATED_NAME
        defaultFeatureFlagShouldBeFound("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME);

        // Get all the featureFlagList where name equals to UPDATED_NAME
        defaultFeatureFlagShouldNotBeFound("name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where name is not null
        defaultFeatureFlagShouldBeFound("name.specified=true");

        // Get all the featureFlagList where name is null
        defaultFeatureFlagShouldNotBeFound("name.specified=false");
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByNameContainsSomething() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where name contains DEFAULT_NAME
        defaultFeatureFlagShouldBeFound("name.contains=" + DEFAULT_NAME);

        // Get all the featureFlagList where name contains UPDATED_NAME
        defaultFeatureFlagShouldNotBeFound("name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where name does not contain DEFAULT_NAME
        defaultFeatureFlagShouldNotBeFound("name.doesNotContain=" + DEFAULT_NAME);

        // Get all the featureFlagList where name does not contain UPDATED_NAME
        defaultFeatureFlagShouldBeFound("name.doesNotContain=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByDescriptionIsEqualToSomething() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where description equals to DEFAULT_DESCRIPTION
        defaultFeatureFlagShouldBeFound("description.equals=" + DEFAULT_DESCRIPTION);

        // Get all the featureFlagList where description equals to UPDATED_DESCRIPTION
        defaultFeatureFlagShouldNotBeFound("description.equals=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByDescriptionIsNotEqualToSomething() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where description not equals to DEFAULT_DESCRIPTION
        defaultFeatureFlagShouldNotBeFound("description.notEquals=" + DEFAULT_DESCRIPTION);

        // Get all the featureFlagList where description not equals to UPDATED_DESCRIPTION
        defaultFeatureFlagShouldBeFound("description.notEquals=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByDescriptionIsInShouldWork() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where description in DEFAULT_DESCRIPTION or UPDATED_DESCRIPTION
        defaultFeatureFlagShouldBeFound("description.in=" + DEFAULT_DESCRIPTION + "," + UPDATED_DESCRIPTION);

        // Get all the featureFlagList where description equals to UPDATED_DESCRIPTION
        defaultFeatureFlagShouldNotBeFound("description.in=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByDescriptionIsNullOrNotNull() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where description is not null
        defaultFeatureFlagShouldBeFound("description.specified=true");

        // Get all the featureFlagList where description is null
        defaultFeatureFlagShouldNotBeFound("description.specified=false");
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByDescriptionContainsSomething() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where description contains DEFAULT_DESCRIPTION
        defaultFeatureFlagShouldBeFound("description.contains=" + DEFAULT_DESCRIPTION);

        // Get all the featureFlagList where description contains UPDATED_DESCRIPTION
        defaultFeatureFlagShouldNotBeFound("description.contains=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByDescriptionNotContainsSomething() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where description does not contain DEFAULT_DESCRIPTION
        defaultFeatureFlagShouldNotBeFound("description.doesNotContain=" + DEFAULT_DESCRIPTION);

        // Get all the featureFlagList where description does not contain UPDATED_DESCRIPTION
        defaultFeatureFlagShouldBeFound("description.doesNotContain=" + UPDATED_DESCRIPTION);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByEnabledIsEqualToSomething() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where enabled equals to DEFAULT_ENABLED
        defaultFeatureFlagShouldBeFound("enabled.equals=" + DEFAULT_ENABLED);

        // Get all the featureFlagList where enabled equals to UPDATED_ENABLED
        defaultFeatureFlagShouldNotBeFound("enabled.equals=" + UPDATED_ENABLED);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByEnabledIsNotEqualToSomething() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where enabled not equals to DEFAULT_ENABLED
        defaultFeatureFlagShouldNotBeFound("enabled.notEquals=" + DEFAULT_ENABLED);

        // Get all the featureFlagList where enabled not equals to UPDATED_ENABLED
        defaultFeatureFlagShouldBeFound("enabled.notEquals=" + UPDATED_ENABLED);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByEnabledIsInShouldWork() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where enabled in DEFAULT_ENABLED or UPDATED_ENABLED
        defaultFeatureFlagShouldBeFound("enabled.in=" + DEFAULT_ENABLED + "," + UPDATED_ENABLED);

        // Get all the featureFlagList where enabled equals to UPDATED_ENABLED
        defaultFeatureFlagShouldNotBeFound("enabled.in=" + UPDATED_ENABLED);
    }

    @Test
    @Transactional
    void getAllFeatureFlagsByEnabledIsNullOrNotNull() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        // Get all the featureFlagList where enabled is not null
        defaultFeatureFlagShouldBeFound("enabled.specified=true");

        // Get all the featureFlagList where enabled is null
        defaultFeatureFlagShouldNotBeFound("enabled.specified=false");
    }

    /**
     * No UserResourceIT, so comment it first
     */
    // @Test
    // @Transactional
    // void getAllFeatureFlagsByUserIsEqualToSomething() throws Exception {
    //     // Initialize the database
    //     featureFlagRepository.saveAndFlush(featureFlag);
    //     User user;
    //     if (TestUtil.findAll(em, User.class).isEmpty()) {
    //         user = UserResourceIT.createEntity(em);
    //         em.persist(user);
    //         em.flush();
    //     } else {
    //         user = TestUtil.findAll(em, User.class).get(0);
    //     }
    //     em.persist(user);
    //     em.flush();
    //     featureFlag.addUser(user);
    //     featureFlagRepository.saveAndFlush(featureFlag);
    //     Long userId = user.getId();

    //     // Get all the featureFlagList where user equals to userId
    //     defaultFeatureFlagShouldBeFound("userId.equals=" + userId);

    //     // Get all the featureFlagList where user equals to "invalid-id"
    //     defaultFeatureFlagShouldNotBeFound("userId.equals=" + "invalid-id");
    // }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultFeatureFlagShouldBeFound(String filter) throws Exception {
        restFeatureFlagMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(featureFlag.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].enabled").value(hasItem(DEFAULT_ENABLED.booleanValue())));

        // Check, that the count call also returns 1
        restFeatureFlagMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultFeatureFlagShouldNotBeFound(String filter) throws Exception {
        restFeatureFlagMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restFeatureFlagMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingFeatureFlag() throws Exception {
        // Get the featureFlag
        restFeatureFlagMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewFeatureFlag() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        int databaseSizeBeforeUpdate = featureFlagRepository.findAll().size();

        // Update the featureFlag
        FeatureFlag updatedFeatureFlag = featureFlagRepository.findById(featureFlag.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedFeatureFlag are not directly saved in db
        em.detach(updatedFeatureFlag);
        updatedFeatureFlag.name(UPDATED_NAME).description(UPDATED_DESCRIPTION).enabled(UPDATED_ENABLED);

        restFeatureFlagMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedFeatureFlag.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedFeatureFlag))
            )
            .andExpect(status().isOk());

        // Validate the FeatureFlag in the database
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeUpdate);
        FeatureFlag testFeatureFlag = featureFlagList.get(featureFlagList.size() - 1);
        assertThat(testFeatureFlag.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testFeatureFlag.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testFeatureFlag.getEnabled()).isEqualTo(UPDATED_ENABLED);
    }

    @Test
    @Transactional
    void putNonExistingFeatureFlag() throws Exception {
        int databaseSizeBeforeUpdate = featureFlagRepository.findAll().size();
        featureFlag.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFeatureFlagMockMvc
            .perform(
                put(ENTITY_API_URL_ID, featureFlag.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(featureFlag))
            )
            .andExpect(status().isBadRequest());

        // Validate the FeatureFlag in the database
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchFeatureFlag() throws Exception {
        int databaseSizeBeforeUpdate = featureFlagRepository.findAll().size();
        featureFlag.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFeatureFlagMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(featureFlag))
            )
            .andExpect(status().isBadRequest());

        // Validate the FeatureFlag in the database
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamFeatureFlag() throws Exception {
        int databaseSizeBeforeUpdate = featureFlagRepository.findAll().size();
        featureFlag.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFeatureFlagMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(featureFlag))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FeatureFlag in the database
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateFeatureFlagWithPatch() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        int databaseSizeBeforeUpdate = featureFlagRepository.findAll().size();

        // Update the featureFlag using partial update
        FeatureFlag partialUpdatedFeatureFlag = new FeatureFlag();
        partialUpdatedFeatureFlag.setId(featureFlag.getId());

        partialUpdatedFeatureFlag.enabled(UPDATED_ENABLED);

        restFeatureFlagMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFeatureFlag.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedFeatureFlag))
            )
            .andExpect(status().isOk());

        // Validate the FeatureFlag in the database
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeUpdate);
        FeatureFlag testFeatureFlag = featureFlagList.get(featureFlagList.size() - 1);
        assertThat(testFeatureFlag.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testFeatureFlag.getDescription()).isEqualTo(DEFAULT_DESCRIPTION);
        assertThat(testFeatureFlag.getEnabled()).isEqualTo(UPDATED_ENABLED);
    }

    @Test
    @Transactional
    void fullUpdateFeatureFlagWithPatch() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        int databaseSizeBeforeUpdate = featureFlagRepository.findAll().size();

        // Update the featureFlag using partial update
        FeatureFlag partialUpdatedFeatureFlag = new FeatureFlag();
        partialUpdatedFeatureFlag.setId(featureFlag.getId());

        partialUpdatedFeatureFlag.name(UPDATED_NAME).description(UPDATED_DESCRIPTION).enabled(UPDATED_ENABLED);

        restFeatureFlagMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFeatureFlag.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedFeatureFlag))
            )
            .andExpect(status().isOk());

        // Validate the FeatureFlag in the database
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeUpdate);
        FeatureFlag testFeatureFlag = featureFlagList.get(featureFlagList.size() - 1);
        assertThat(testFeatureFlag.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testFeatureFlag.getDescription()).isEqualTo(UPDATED_DESCRIPTION);
        assertThat(testFeatureFlag.getEnabled()).isEqualTo(UPDATED_ENABLED);
    }

    @Test
    @Transactional
    void patchNonExistingFeatureFlag() throws Exception {
        int databaseSizeBeforeUpdate = featureFlagRepository.findAll().size();
        featureFlag.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFeatureFlagMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, featureFlag.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(featureFlag))
            )
            .andExpect(status().isBadRequest());

        // Validate the FeatureFlag in the database
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchFeatureFlag() throws Exception {
        int databaseSizeBeforeUpdate = featureFlagRepository.findAll().size();
        featureFlag.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFeatureFlagMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(featureFlag))
            )
            .andExpect(status().isBadRequest());

        // Validate the FeatureFlag in the database
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamFeatureFlag() throws Exception {
        int databaseSizeBeforeUpdate = featureFlagRepository.findAll().size();
        featureFlag.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFeatureFlagMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(featureFlag))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FeatureFlag in the database
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteFeatureFlag() throws Exception {
        // Initialize the database
        featureFlagRepository.saveAndFlush(featureFlag);

        int databaseSizeBeforeDelete = featureFlagRepository.findAll().size();

        // Delete the featureFlag
        restFeatureFlagMockMvc
            .perform(delete(ENTITY_API_URL_ID, featureFlag.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<FeatureFlag> featureFlagList = featureFlagRepository.findAll();
        assertThat(featureFlagList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
