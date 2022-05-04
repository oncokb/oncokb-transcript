package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.repository.DrugRepository;
import org.mskcc.oncokb.curation.repository.search.DrugSearchRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link DrugResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class DrugResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_SEMANTIC_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_SEMANTIC_TYPE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/drugs";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";
    private static final String ENTITY_SEARCH_API_URL = "/api/_search/drugs";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private DrugRepository drugRepository;

    /**
     * This repository is mocked in the org.mskcc.oncokb.curation.repository.search test package.
     *
     * @see org.mskcc.oncokb.curation.repository.search.DrugSearchRepositoryMockConfiguration
     */
    @Autowired
    private DrugSearchRepository mockDrugSearchRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDrugMockMvc;

    private Drug drug;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Drug createEntity(EntityManager em) {
        Drug drug = new Drug().name(DEFAULT_NAME).code(DEFAULT_CODE).semanticType(DEFAULT_SEMANTIC_TYPE);
        return drug;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Drug createUpdatedEntity(EntityManager em) {
        Drug drug = new Drug().name(UPDATED_NAME).code(UPDATED_CODE).semanticType(UPDATED_SEMANTIC_TYPE);
        return drug;
    }

    @BeforeEach
    public void initTest() {
        drug = createEntity(em);
    }

    @Test
    @Transactional
    void createDrug() throws Exception {
        int databaseSizeBeforeCreate = drugRepository.findAll().size();
        // Create the Drug
        restDrugMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(drug))
            )
            .andExpect(status().isCreated());

        // Validate the Drug in the database
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeCreate + 1);
        Drug testDrug = drugList.get(drugList.size() - 1);
        assertThat(testDrug.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testDrug.getCode()).isEqualTo(DEFAULT_CODE);
        assertThat(testDrug.getSemanticType()).isEqualTo(DEFAULT_SEMANTIC_TYPE);

        // Validate the Drug in Elasticsearch
        verify(mockDrugSearchRepository, times(1)).save(testDrug);
    }

    @Test
    @Transactional
    void createDrugWithExistingId() throws Exception {
        // Create the Drug with an existing ID
        drug.setId(1L);

        int databaseSizeBeforeCreate = drugRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDrugMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(drug))
            )
            .andExpect(status().isBadRequest());

        // Validate the Drug in the database
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeCreate);

        // Validate the Drug in Elasticsearch
        verify(mockDrugSearchRepository, times(0)).save(drug);
    }

    @Test
    @Transactional
    void getAllDrugs() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        // Get all the drugList
        restDrugMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(drug.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].semanticType").value(hasItem(DEFAULT_SEMANTIC_TYPE.toString())));
    }

    @Test
    @Transactional
    void getDrug() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        // Get the drug
        restDrugMockMvc
            .perform(get(ENTITY_API_URL_ID, drug.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(drug.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.semanticType").value(DEFAULT_SEMANTIC_TYPE.toString()));
    }

    @Test
    @Transactional
    void getNonExistingDrug() throws Exception {
        // Get the drug
        restDrugMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewDrug() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        int databaseSizeBeforeUpdate = drugRepository.findAll().size();

        // Update the drug
        Drug updatedDrug = drugRepository.findById(drug.getId()).get();
        // Disconnect from session so that the updates on updatedDrug are not directly saved in db
        em.detach(updatedDrug);
        updatedDrug.name(UPDATED_NAME).code(UPDATED_CODE).semanticType(UPDATED_SEMANTIC_TYPE);

        restDrugMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedDrug.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedDrug))
            )
            .andExpect(status().isOk());

        // Validate the Drug in the database
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeUpdate);
        Drug testDrug = drugList.get(drugList.size() - 1);
        assertThat(testDrug.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testDrug.getCode()).isEqualTo(UPDATED_CODE);
        assertThat(testDrug.getSemanticType()).isEqualTo(UPDATED_SEMANTIC_TYPE);

        // Validate the Drug in Elasticsearch
        verify(mockDrugSearchRepository).save(testDrug);
    }

    @Test
    @Transactional
    void putNonExistingDrug() throws Exception {
        int databaseSizeBeforeUpdate = drugRepository.findAll().size();
        drug.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDrugMockMvc
            .perform(
                put(ENTITY_API_URL_ID, drug.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drug))
            )
            .andExpect(status().isBadRequest());

        // Validate the Drug in the database
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Drug in Elasticsearch
        verify(mockDrugSearchRepository, times(0)).save(drug);
    }

    @Test
    @Transactional
    void putWithIdMismatchDrug() throws Exception {
        int databaseSizeBeforeUpdate = drugRepository.findAll().size();
        drug.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drug))
            )
            .andExpect(status().isBadRequest());

        // Validate the Drug in the database
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Drug in Elasticsearch
        verify(mockDrugSearchRepository, times(0)).save(drug);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDrug() throws Exception {
        int databaseSizeBeforeUpdate = drugRepository.findAll().size();
        drug.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(drug))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Drug in the database
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Drug in Elasticsearch
        verify(mockDrugSearchRepository, times(0)).save(drug);
    }

    @Test
    @Transactional
    void partialUpdateDrugWithPatch() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        int databaseSizeBeforeUpdate = drugRepository.findAll().size();

        // Update the drug using partial update
        Drug partialUpdatedDrug = new Drug();
        partialUpdatedDrug.setId(drug.getId());

        partialUpdatedDrug.name(UPDATED_NAME).semanticType(UPDATED_SEMANTIC_TYPE);

        restDrugMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDrug.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDrug))
            )
            .andExpect(status().isOk());

        // Validate the Drug in the database
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeUpdate);
        Drug testDrug = drugList.get(drugList.size() - 1);
        assertThat(testDrug.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testDrug.getCode()).isEqualTo(DEFAULT_CODE);
        assertThat(testDrug.getSemanticType()).isEqualTo(UPDATED_SEMANTIC_TYPE);
    }

    @Test
    @Transactional
    void fullUpdateDrugWithPatch() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        int databaseSizeBeforeUpdate = drugRepository.findAll().size();

        // Update the drug using partial update
        Drug partialUpdatedDrug = new Drug();
        partialUpdatedDrug.setId(drug.getId());

        partialUpdatedDrug.name(UPDATED_NAME).code(UPDATED_CODE).semanticType(UPDATED_SEMANTIC_TYPE);

        restDrugMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDrug.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDrug))
            )
            .andExpect(status().isOk());

        // Validate the Drug in the database
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeUpdate);
        Drug testDrug = drugList.get(drugList.size() - 1);
        assertThat(testDrug.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testDrug.getCode()).isEqualTo(UPDATED_CODE);
        assertThat(testDrug.getSemanticType()).isEqualTo(UPDATED_SEMANTIC_TYPE);
    }

    @Test
    @Transactional
    void patchNonExistingDrug() throws Exception {
        int databaseSizeBeforeUpdate = drugRepository.findAll().size();
        drug.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDrugMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, drug.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drug))
            )
            .andExpect(status().isBadRequest());

        // Validate the Drug in the database
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Drug in Elasticsearch
        verify(mockDrugSearchRepository, times(0)).save(drug);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDrug() throws Exception {
        int databaseSizeBeforeUpdate = drugRepository.findAll().size();
        drug.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drug))
            )
            .andExpect(status().isBadRequest());

        // Validate the Drug in the database
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Drug in Elasticsearch
        verify(mockDrugSearchRepository, times(0)).save(drug);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDrug() throws Exception {
        int databaseSizeBeforeUpdate = drugRepository.findAll().size();
        drug.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drug))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Drug in the database
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeUpdate);

        // Validate the Drug in Elasticsearch
        verify(mockDrugSearchRepository, times(0)).save(drug);
    }

    @Test
    @Transactional
    void deleteDrug() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        int databaseSizeBeforeDelete = drugRepository.findAll().size();

        // Delete the drug
        restDrugMockMvc
            .perform(delete(ENTITY_API_URL_ID, drug.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeDelete - 1);

        // Validate the Drug in Elasticsearch
        verify(mockDrugSearchRepository, times(1)).deleteById(drug.getId());
    }

    @Test
    @Transactional
    void searchDrug() throws Exception {
        // Configure the mock search repository
        // Initialize the database
        drugRepository.saveAndFlush(drug);
        when(mockDrugSearchRepository.search("id:" + drug.getId(), PageRequest.of(0, 20)))
            .thenReturn(new PageImpl<>(Collections.singletonList(drug), PageRequest.of(0, 1), 1));

        // Search the drug
        restDrugMockMvc
            .perform(get(ENTITY_SEARCH_API_URL + "?query=id:" + drug.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(drug.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].semanticType").value(hasItem(DEFAULT_SEMANTIC_TYPE.toString())));
    }
}
