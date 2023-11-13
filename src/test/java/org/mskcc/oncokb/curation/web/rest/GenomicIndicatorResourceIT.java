package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import javax.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mskcc.oncokb.curation.IntegrationTest;
import org.mskcc.oncokb.curation.domain.Association;
import org.mskcc.oncokb.curation.domain.GenomicIndicator;
import org.mskcc.oncokb.curation.repository.GenomicIndicatorRepository;
import org.mskcc.oncokb.curation.service.GenomicIndicatorService;
import org.mskcc.oncokb.curation.service.criteria.GenomicIndicatorCriteria;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link GenomicIndicatorResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class GenomicIndicatorResourceIT {

    private static final String DEFAULT_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/genomic-indicators";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private GenomicIndicatorRepository genomicIndicatorRepository;

    @Mock
    private GenomicIndicatorRepository genomicIndicatorRepositoryMock;

    @Mock
    private GenomicIndicatorService genomicIndicatorServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restGenomicIndicatorMockMvc;

    private GenomicIndicator genomicIndicator;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static GenomicIndicator createEntity(EntityManager em) {
        GenomicIndicator genomicIndicator = new GenomicIndicator().type(DEFAULT_TYPE).name(DEFAULT_NAME);
        return genomicIndicator;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static GenomicIndicator createUpdatedEntity(EntityManager em) {
        GenomicIndicator genomicIndicator = new GenomicIndicator().type(UPDATED_TYPE).name(UPDATED_NAME);
        return genomicIndicator;
    }

    @BeforeEach
    public void initTest() {
        genomicIndicator = createEntity(em);
    }

    @Test
    @Transactional
    void createGenomicIndicator() throws Exception {
        int databaseSizeBeforeCreate = genomicIndicatorRepository.findAll().size();
        // Create the GenomicIndicator
        restGenomicIndicatorMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomicIndicator))
            )
            .andExpect(status().isCreated());

        // Validate the GenomicIndicator in the database
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeCreate + 1);
        GenomicIndicator testGenomicIndicator = genomicIndicatorList.get(genomicIndicatorList.size() - 1);
        assertThat(testGenomicIndicator.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testGenomicIndicator.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void createGenomicIndicatorWithExistingId() throws Exception {
        // Create the GenomicIndicator with an existing ID
        genomicIndicator.setId(1L);

        int databaseSizeBeforeCreate = genomicIndicatorRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restGenomicIndicatorMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomicIndicator))
            )
            .andExpect(status().isBadRequest());

        // Validate the GenomicIndicator in the database
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = genomicIndicatorRepository.findAll().size();
        // set the field null
        genomicIndicator.setType(null);

        // Create the GenomicIndicator, which fails.

        restGenomicIndicatorMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomicIndicator))
            )
            .andExpect(status().isBadRequest());

        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = genomicIndicatorRepository.findAll().size();
        // set the field null
        genomicIndicator.setName(null);

        // Create the GenomicIndicator, which fails.

        restGenomicIndicatorMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomicIndicator))
            )
            .andExpect(status().isBadRequest());

        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllGenomicIndicators() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList
        restGenomicIndicatorMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(genomicIndicator.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllGenomicIndicatorsWithEagerRelationshipsIsEnabled() throws Exception {
        when(genomicIndicatorServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restGenomicIndicatorMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(genomicIndicatorServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllGenomicIndicatorsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(genomicIndicatorServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restGenomicIndicatorMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(genomicIndicatorServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getGenomicIndicator() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get the genomicIndicator
        restGenomicIndicatorMockMvc
            .perform(get(ENTITY_API_URL_ID, genomicIndicator.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(genomicIndicator.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }

    @Test
    @Transactional
    void getGenomicIndicatorsByIdFiltering() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        Long id = genomicIndicator.getId();

        defaultGenomicIndicatorShouldBeFound("id.equals=" + id);
        defaultGenomicIndicatorShouldNotBeFound("id.notEquals=" + id);

        defaultGenomicIndicatorShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultGenomicIndicatorShouldNotBeFound("id.greaterThan=" + id);

        defaultGenomicIndicatorShouldBeFound("id.lessThanOrEqual=" + id);
        defaultGenomicIndicatorShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByTypeIsEqualToSomething() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where type equals to DEFAULT_TYPE
        defaultGenomicIndicatorShouldBeFound("type.equals=" + DEFAULT_TYPE);

        // Get all the genomicIndicatorList where type equals to UPDATED_TYPE
        defaultGenomicIndicatorShouldNotBeFound("type.equals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByTypeIsNotEqualToSomething() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where type not equals to DEFAULT_TYPE
        defaultGenomicIndicatorShouldNotBeFound("type.notEquals=" + DEFAULT_TYPE);

        // Get all the genomicIndicatorList where type not equals to UPDATED_TYPE
        defaultGenomicIndicatorShouldBeFound("type.notEquals=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByTypeIsInShouldWork() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where type in DEFAULT_TYPE or UPDATED_TYPE
        defaultGenomicIndicatorShouldBeFound("type.in=" + DEFAULT_TYPE + "," + UPDATED_TYPE);

        // Get all the genomicIndicatorList where type equals to UPDATED_TYPE
        defaultGenomicIndicatorShouldNotBeFound("type.in=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByTypeIsNullOrNotNull() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where type is not null
        defaultGenomicIndicatorShouldBeFound("type.specified=true");

        // Get all the genomicIndicatorList where type is null
        defaultGenomicIndicatorShouldNotBeFound("type.specified=false");
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByTypeContainsSomething() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where type contains DEFAULT_TYPE
        defaultGenomicIndicatorShouldBeFound("type.contains=" + DEFAULT_TYPE);

        // Get all the genomicIndicatorList where type contains UPDATED_TYPE
        defaultGenomicIndicatorShouldNotBeFound("type.contains=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByTypeNotContainsSomething() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where type does not contain DEFAULT_TYPE
        defaultGenomicIndicatorShouldNotBeFound("type.doesNotContain=" + DEFAULT_TYPE);

        // Get all the genomicIndicatorList where type does not contain UPDATED_TYPE
        defaultGenomicIndicatorShouldBeFound("type.doesNotContain=" + UPDATED_TYPE);
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where name equals to DEFAULT_NAME
        defaultGenomicIndicatorShouldBeFound("name.equals=" + DEFAULT_NAME);

        // Get all the genomicIndicatorList where name equals to UPDATED_NAME
        defaultGenomicIndicatorShouldNotBeFound("name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where name not equals to DEFAULT_NAME
        defaultGenomicIndicatorShouldNotBeFound("name.notEquals=" + DEFAULT_NAME);

        // Get all the genomicIndicatorList where name not equals to UPDATED_NAME
        defaultGenomicIndicatorShouldBeFound("name.notEquals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where name in DEFAULT_NAME or UPDATED_NAME
        defaultGenomicIndicatorShouldBeFound("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME);

        // Get all the genomicIndicatorList where name equals to UPDATED_NAME
        defaultGenomicIndicatorShouldNotBeFound("name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where name is not null
        defaultGenomicIndicatorShouldBeFound("name.specified=true");

        // Get all the genomicIndicatorList where name is null
        defaultGenomicIndicatorShouldNotBeFound("name.specified=false");
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByNameContainsSomething() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where name contains DEFAULT_NAME
        defaultGenomicIndicatorShouldBeFound("name.contains=" + DEFAULT_NAME);

        // Get all the genomicIndicatorList where name contains UPDATED_NAME
        defaultGenomicIndicatorShouldNotBeFound("name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        // Get all the genomicIndicatorList where name does not contain DEFAULT_NAME
        defaultGenomicIndicatorShouldNotBeFound("name.doesNotContain=" + DEFAULT_NAME);

        // Get all the genomicIndicatorList where name does not contain UPDATED_NAME
        defaultGenomicIndicatorShouldBeFound("name.doesNotContain=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllGenomicIndicatorsByAssociationIsEqualToSomething() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);
        Association association;
        if (TestUtil.findAll(em, Association.class).isEmpty()) {
            association = AssociationResourceIT.createEntity(em);
            em.persist(association);
            em.flush();
        } else {
            association = TestUtil.findAll(em, Association.class).get(0);
        }
        em.persist(association);
        em.flush();
        genomicIndicator.addAssociation(association);
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);
        Long associationId = association.getId();

        // Get all the genomicIndicatorList where association equals to associationId
        defaultGenomicIndicatorShouldBeFound("associationId.equals=" + associationId);

        // Get all the genomicIndicatorList where association equals to (associationId + 1)
        defaultGenomicIndicatorShouldNotBeFound("associationId.equals=" + (associationId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultGenomicIndicatorShouldBeFound(String filter) throws Exception {
        restGenomicIndicatorMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(genomicIndicator.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));

        // Check, that the count call also returns 1
        restGenomicIndicatorMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultGenomicIndicatorShouldNotBeFound(String filter) throws Exception {
        restGenomicIndicatorMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restGenomicIndicatorMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
    }

    @Test
    @Transactional
    void getNonExistingGenomicIndicator() throws Exception {
        // Get the genomicIndicator
        restGenomicIndicatorMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewGenomicIndicator() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        int databaseSizeBeforeUpdate = genomicIndicatorRepository.findAll().size();

        // Update the genomicIndicator
        GenomicIndicator updatedGenomicIndicator = genomicIndicatorRepository.findById(genomicIndicator.getId()).get();
        // Disconnect from session so that the updates on updatedGenomicIndicator are not directly saved in db
        em.detach(updatedGenomicIndicator);
        updatedGenomicIndicator.type(UPDATED_TYPE).name(UPDATED_NAME);

        restGenomicIndicatorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedGenomicIndicator.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedGenomicIndicator))
            )
            .andExpect(status().isOk());

        // Validate the GenomicIndicator in the database
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeUpdate);
        GenomicIndicator testGenomicIndicator = genomicIndicatorList.get(genomicIndicatorList.size() - 1);
        assertThat(testGenomicIndicator.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testGenomicIndicator.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void putNonExistingGenomicIndicator() throws Exception {
        int databaseSizeBeforeUpdate = genomicIndicatorRepository.findAll().size();
        genomicIndicator.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGenomicIndicatorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, genomicIndicator.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomicIndicator))
            )
            .andExpect(status().isBadRequest());

        // Validate the GenomicIndicator in the database
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchGenomicIndicator() throws Exception {
        int databaseSizeBeforeUpdate = genomicIndicatorRepository.findAll().size();
        genomicIndicator.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGenomicIndicatorMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomicIndicator))
            )
            .andExpect(status().isBadRequest());

        // Validate the GenomicIndicator in the database
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamGenomicIndicator() throws Exception {
        int databaseSizeBeforeUpdate = genomicIndicatorRepository.findAll().size();
        genomicIndicator.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGenomicIndicatorMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(genomicIndicator))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the GenomicIndicator in the database
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateGenomicIndicatorWithPatch() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        int databaseSizeBeforeUpdate = genomicIndicatorRepository.findAll().size();

        // Update the genomicIndicator using partial update
        GenomicIndicator partialUpdatedGenomicIndicator = new GenomicIndicator();
        partialUpdatedGenomicIndicator.setId(genomicIndicator.getId());

        restGenomicIndicatorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGenomicIndicator.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedGenomicIndicator))
            )
            .andExpect(status().isOk());

        // Validate the GenomicIndicator in the database
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeUpdate);
        GenomicIndicator testGenomicIndicator = genomicIndicatorList.get(genomicIndicatorList.size() - 1);
        assertThat(testGenomicIndicator.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testGenomicIndicator.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void fullUpdateGenomicIndicatorWithPatch() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        int databaseSizeBeforeUpdate = genomicIndicatorRepository.findAll().size();

        // Update the genomicIndicator using partial update
        GenomicIndicator partialUpdatedGenomicIndicator = new GenomicIndicator();
        partialUpdatedGenomicIndicator.setId(genomicIndicator.getId());

        partialUpdatedGenomicIndicator.type(UPDATED_TYPE).name(UPDATED_NAME);

        restGenomicIndicatorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedGenomicIndicator.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedGenomicIndicator))
            )
            .andExpect(status().isOk());

        // Validate the GenomicIndicator in the database
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeUpdate);
        GenomicIndicator testGenomicIndicator = genomicIndicatorList.get(genomicIndicatorList.size() - 1);
        assertThat(testGenomicIndicator.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testGenomicIndicator.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void patchNonExistingGenomicIndicator() throws Exception {
        int databaseSizeBeforeUpdate = genomicIndicatorRepository.findAll().size();
        genomicIndicator.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restGenomicIndicatorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, genomicIndicator.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(genomicIndicator))
            )
            .andExpect(status().isBadRequest());

        // Validate the GenomicIndicator in the database
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchGenomicIndicator() throws Exception {
        int databaseSizeBeforeUpdate = genomicIndicatorRepository.findAll().size();
        genomicIndicator.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGenomicIndicatorMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(genomicIndicator))
            )
            .andExpect(status().isBadRequest());

        // Validate the GenomicIndicator in the database
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamGenomicIndicator() throws Exception {
        int databaseSizeBeforeUpdate = genomicIndicatorRepository.findAll().size();
        genomicIndicator.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restGenomicIndicatorMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(genomicIndicator))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the GenomicIndicator in the database
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteGenomicIndicator() throws Exception {
        // Initialize the database
        genomicIndicatorRepository.saveAndFlush(genomicIndicator);

        int databaseSizeBeforeDelete = genomicIndicatorRepository.findAll().size();

        // Delete the genomicIndicator
        restGenomicIndicatorMockMvc
            .perform(delete(ENTITY_API_URL_ID, genomicIndicator.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<GenomicIndicator> genomicIndicatorList = genomicIndicatorRepository.findAll();
        assertThat(genomicIndicatorList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
