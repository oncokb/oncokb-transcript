package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.ArrayList;
import java.util.Collections;
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
import org.mskcc.oncokb.curation.domain.ClinicalTrialsGovCondition;
import org.mskcc.oncokb.curation.repository.ClinicalTrialsGovConditionRepository;
import org.mskcc.oncokb.curation.repository.search.ClinicalTrialsGovConditionSearchRepository;
import org.mskcc.oncokb.curation.service.ClinicalTrialsGovConditionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link ClinicalTrialsGovConditionResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ClinicalTrialsGovConditionResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/clinical-trials-gov-conditions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/_search/clinical-trials-gov-conditions";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private ClinicalTrialsGovConditionRepository clinicalTrialsGovConditionRepository;

    @Mock
    private ClinicalTrialsGovConditionRepository clinicalTrialsGovConditionRepositoryMock;

    @Mock
    private ClinicalTrialsGovConditionService clinicalTrialsGovConditionServiceMock;

    /**
     * This repository is mocked in the org.mskcc.oncokb.curation.repository.search test package.
     *
     * @see org.mskcc.oncokb.curation.repository.search.ClinicalTrialsGovConditionSearchRepositoryMockConfiguration
     */
    @Autowired
    private ClinicalTrialsGovConditionSearchRepository mockClinicalTrialsGovConditionSearchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restClinicalTrialsGovConditionMockMvc;

    private ClinicalTrialsGovCondition clinicalTrialsGovCondition;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClinicalTrialsGovCondition createEntity(EntityManager em) {
        ClinicalTrialsGovCondition clinicalTrialsGovCondition = new ClinicalTrialsGovCondition().name(DEFAULT_NAME);
        return clinicalTrialsGovCondition;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClinicalTrialsGovCondition createUpdatedEntity(EntityManager em) {
        ClinicalTrialsGovCondition clinicalTrialsGovCondition = new ClinicalTrialsGovCondition().name(UPDATED_NAME);
        return clinicalTrialsGovCondition;
    }

    @BeforeEach
    public void initTest() {
        clinicalTrialsGovCondition = createEntity(em);
    }

    @Test
    @Transactional
    void createClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeCreate = clinicalTrialsGovConditionRepository.findAll().size();
        // Create the ClinicalTrialsGovCondition
        restClinicalTrialsGovConditionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isCreated());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeCreate + 1);
        ClinicalTrialsGovCondition testClinicalTrialsGovCondition = clinicalTrialsGovConditionList.get(
            clinicalTrialsGovConditionList.size() - 1
        );
        assertThat(testClinicalTrialsGovCondition.getName()).isEqualTo(DEFAULT_NAME);

        // Validate the ClinicalTrialsGovCondition in Elasticsearch
        verify(mockClinicalTrialsGovConditionSearchRepository, times(1)).save(testClinicalTrialsGovCondition);
    }

    @Test
    @Transactional
    void createClinicalTrialsGovConditionWithExistingId() throws Exception {
        // Create the ClinicalTrialsGovCondition with an existing ID
        clinicalTrialsGovCondition.setId(1L);

        int databaseSizeBeforeCreate = clinicalTrialsGovConditionRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restClinicalTrialsGovConditionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeCreate);

        // Validate the ClinicalTrialsGovCondition in Elasticsearch
        verify(mockClinicalTrialsGovConditionSearchRepository, times(0)).save(clinicalTrialsGovCondition);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = clinicalTrialsGovConditionRepository.findAll().size();
        // set the field null
        clinicalTrialsGovCondition.setName(null);

        // Create the ClinicalTrialsGovCondition, which fails.

        restClinicalTrialsGovConditionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllClinicalTrialsGovConditions() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        // Get all the clinicalTrialsGovConditionList
        restClinicalTrialsGovConditionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clinicalTrialsGovCondition.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClinicalTrialsGovConditionsWithEagerRelationshipsIsEnabled() throws Exception {
        when(clinicalTrialsGovConditionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClinicalTrialsGovConditionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(clinicalTrialsGovConditionServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClinicalTrialsGovConditionsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(clinicalTrialsGovConditionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClinicalTrialsGovConditionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(clinicalTrialsGovConditionServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @Test
    @Transactional
    void getClinicalTrialsGovCondition() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        // Get the clinicalTrialsGovCondition
        restClinicalTrialsGovConditionMockMvc
            .perform(get(ENTITY_API_URL_ID, clinicalTrialsGovCondition.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(clinicalTrialsGovCondition.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME));
    }

    @Test
    @Transactional
    void getNonExistingClinicalTrialsGovCondition() throws Exception {
        // Get the clinicalTrialsGovCondition
        restClinicalTrialsGovConditionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewClinicalTrialsGovCondition() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();

        // Update the clinicalTrialsGovCondition
        ClinicalTrialsGovCondition updatedClinicalTrialsGovCondition = clinicalTrialsGovConditionRepository
            .findById(clinicalTrialsGovCondition.getId())
            .get();
        // Disconnect from session so that the updates on updatedClinicalTrialsGovCondition are not directly saved in db
        em.detach(updatedClinicalTrialsGovCondition);
        updatedClinicalTrialsGovCondition.name(UPDATED_NAME);

        restClinicalTrialsGovConditionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedClinicalTrialsGovCondition.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedClinicalTrialsGovCondition))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrialsGovCondition testClinicalTrialsGovCondition = clinicalTrialsGovConditionList.get(
            clinicalTrialsGovConditionList.size() - 1
        );
        assertThat(testClinicalTrialsGovCondition.getName()).isEqualTo(UPDATED_NAME);

        // Validate the ClinicalTrialsGovCondition in Elasticsearch
        verify(mockClinicalTrialsGovConditionSearchRepository).save(testClinicalTrialsGovCondition);
    }

    @Test
    @Transactional
    void putNonExistingClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, clinicalTrialsGovCondition.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);

        // Validate the ClinicalTrialsGovCondition in Elasticsearch
        verify(mockClinicalTrialsGovConditionSearchRepository, times(0)).save(clinicalTrialsGovCondition);
    }

    @Test
    @Transactional
    void putWithIdMismatchClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);

        // Validate the ClinicalTrialsGovCondition in Elasticsearch
        verify(mockClinicalTrialsGovConditionSearchRepository, times(0)).save(clinicalTrialsGovCondition);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);

        // Validate the ClinicalTrialsGovCondition in Elasticsearch
        verify(mockClinicalTrialsGovConditionSearchRepository, times(0)).save(clinicalTrialsGovCondition);
    }

    @Test
    @Transactional
    void partialUpdateClinicalTrialsGovConditionWithPatch() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();

        // Update the clinicalTrialsGovCondition using partial update
        ClinicalTrialsGovCondition partialUpdatedClinicalTrialsGovCondition = new ClinicalTrialsGovCondition();
        partialUpdatedClinicalTrialsGovCondition.setId(clinicalTrialsGovCondition.getId());

        restClinicalTrialsGovConditionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClinicalTrialsGovCondition.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClinicalTrialsGovCondition))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrialsGovCondition testClinicalTrialsGovCondition = clinicalTrialsGovConditionList.get(
            clinicalTrialsGovConditionList.size() - 1
        );
        assertThat(testClinicalTrialsGovCondition.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void fullUpdateClinicalTrialsGovConditionWithPatch() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();

        // Update the clinicalTrialsGovCondition using partial update
        ClinicalTrialsGovCondition partialUpdatedClinicalTrialsGovCondition = new ClinicalTrialsGovCondition();
        partialUpdatedClinicalTrialsGovCondition.setId(clinicalTrialsGovCondition.getId());

        partialUpdatedClinicalTrialsGovCondition.name(UPDATED_NAME);

        restClinicalTrialsGovConditionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClinicalTrialsGovCondition.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedClinicalTrialsGovCondition))
            )
            .andExpect(status().isOk());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);
        ClinicalTrialsGovCondition testClinicalTrialsGovCondition = clinicalTrialsGovConditionList.get(
            clinicalTrialsGovConditionList.size() - 1
        );
        assertThat(testClinicalTrialsGovCondition.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void patchNonExistingClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, clinicalTrialsGovCondition.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);

        // Validate the ClinicalTrialsGovCondition in Elasticsearch
        verify(mockClinicalTrialsGovConditionSearchRepository, times(0)).save(clinicalTrialsGovCondition);
    }

    @Test
    @Transactional
    void patchWithIdMismatchClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);

        // Validate the ClinicalTrialsGovCondition in Elasticsearch
        verify(mockClinicalTrialsGovConditionSearchRepository, times(0)).save(clinicalTrialsGovCondition);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamClinicalTrialsGovCondition() throws Exception {
        int databaseSizeBeforeUpdate = clinicalTrialsGovConditionRepository.findAll().size();
        clinicalTrialsGovCondition.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClinicalTrialsGovConditionMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(clinicalTrialsGovCondition))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClinicalTrialsGovCondition in the database
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeUpdate);

        // Validate the ClinicalTrialsGovCondition in Elasticsearch
        verify(mockClinicalTrialsGovConditionSearchRepository, times(0)).save(clinicalTrialsGovCondition);
    }

    @Test
    @Transactional
    void deleteClinicalTrialsGovCondition() throws Exception {
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);

        int databaseSizeBeforeDelete = clinicalTrialsGovConditionRepository.findAll().size();

        // Delete the clinicalTrialsGovCondition
        restClinicalTrialsGovConditionMockMvc
            .perform(delete(ENTITY_API_URL_ID, clinicalTrialsGovCondition.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<ClinicalTrialsGovCondition> clinicalTrialsGovConditionList = clinicalTrialsGovConditionRepository.findAll();
        assertThat(clinicalTrialsGovConditionList).hasSize(databaseSizeBeforeDelete - 1);

        // Validate the ClinicalTrialsGovCondition in Elasticsearch
        verify(mockClinicalTrialsGovConditionSearchRepository, times(1)).deleteById(clinicalTrialsGovCondition.getId());
    }

    @Test
    @Transactional
    void searchClinicalTrialsGovCondition() throws Exception {
        // Configure the mock search repository
        // Initialize the database
        clinicalTrialsGovConditionRepository.saveAndFlush(clinicalTrialsGovCondition);
        when(mockClinicalTrialsGovConditionSearchRepository.search("id:" + clinicalTrialsGovCondition.getId(), PageRequest.of(0, 20)))
            .thenReturn(new PageImpl<>(Collections.singletonList(clinicalTrialsGovCondition), PageRequest.of(0, 1), 1));

        // Search the clinicalTrialsGovCondition
        restClinicalTrialsGovConditionMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + clinicalTrialsGovCondition.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clinicalTrialsGovCondition.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)));
    }
}
