package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

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
import org.mskcc.oncokb.curation.domain.DrugSynonym;
import org.mskcc.oncokb.curation.repository.DrugSynonymRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.Base64Utils;

/**
 * Integration tests for the {@link DrugSynonymResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class DrugSynonymResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/drug-synonyms";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private DrugSynonymRepository drugSynonymRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDrugSynonymMockMvc;

    private DrugSynonym drugSynonym;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DrugSynonym createEntity(EntityManager em) {
        DrugSynonym drugSynonym = new DrugSynonym().name(DEFAULT_NAME);
        return drugSynonym;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DrugSynonym createUpdatedEntity(EntityManager em) {
        DrugSynonym drugSynonym = new DrugSynonym().name(UPDATED_NAME);
        return drugSynonym;
    }

    @BeforeEach
    public void initTest() {
        drugSynonym = createEntity(em);
    }

    @Test
    @Transactional
    void createDrugSynonym() throws Exception {
        int databaseSizeBeforeCreate = drugSynonymRepository.findAll().size();
        // Create the DrugSynonym
        restDrugSynonymMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugSynonym))
            )
            .andExpect(status().isCreated());

        // Validate the DrugSynonym in the database
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeCreate + 1);
        DrugSynonym testDrugSynonym = drugSynonymList.get(drugSynonymList.size() - 1);
        assertThat(testDrugSynonym.getName()).isEqualTo(DEFAULT_NAME);
    }

    @Test
    @Transactional
    void createDrugSynonymWithExistingId() throws Exception {
        // Create the DrugSynonym with an existing ID
        drugSynonym.setId(1L);

        int databaseSizeBeforeCreate = drugSynonymRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDrugSynonymMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugSynonym))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugSynonym in the database
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllDrugSynonyms() throws Exception {
        // Initialize the database
        drugSynonymRepository.saveAndFlush(drugSynonym);

        // Get all the drugSynonymList
        restDrugSynonymMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(drugSynonym.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())));
    }

    @Test
    @Transactional
    void getDrugSynonym() throws Exception {
        // Initialize the database
        drugSynonymRepository.saveAndFlush(drugSynonym);

        // Get the drugSynonym
        restDrugSynonymMockMvc
            .perform(get(ENTITY_API_URL_ID, drugSynonym.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(drugSynonym.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()));
    }

    @Test
    @Transactional
    void getNonExistingDrugSynonym() throws Exception {
        // Get the drugSynonym
        restDrugSynonymMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewDrugSynonym() throws Exception {
        // Initialize the database
        drugSynonymRepository.saveAndFlush(drugSynonym);

        int databaseSizeBeforeUpdate = drugSynonymRepository.findAll().size();

        // Update the drugSynonym
        DrugSynonym updatedDrugSynonym = drugSynonymRepository.findById(drugSynonym.getId()).get();
        // Disconnect from session so that the updates on updatedDrugSynonym are not directly saved in db
        em.detach(updatedDrugSynonym);
        updatedDrugSynonym.name(UPDATED_NAME);

        restDrugSynonymMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedDrugSynonym.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedDrugSynonym))
            )
            .andExpect(status().isOk());

        // Validate the DrugSynonym in the database
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeUpdate);
        DrugSynonym testDrugSynonym = drugSynonymList.get(drugSynonymList.size() - 1);
        assertThat(testDrugSynonym.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void putNonExistingDrugSynonym() throws Exception {
        int databaseSizeBeforeUpdate = drugSynonymRepository.findAll().size();
        drugSynonym.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDrugSynonymMockMvc
            .perform(
                put(ENTITY_API_URL_ID, drugSynonym.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugSynonym))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugSynonym in the database
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDrugSynonym() throws Exception {
        int databaseSizeBeforeUpdate = drugSynonymRepository.findAll().size();
        drugSynonym.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugSynonymMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugSynonym))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugSynonym in the database
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDrugSynonym() throws Exception {
        int databaseSizeBeforeUpdate = drugSynonymRepository.findAll().size();
        drugSynonym.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugSynonymMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugSynonym))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DrugSynonym in the database
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDrugSynonymWithPatch() throws Exception {
        // Initialize the database
        drugSynonymRepository.saveAndFlush(drugSynonym);

        int databaseSizeBeforeUpdate = drugSynonymRepository.findAll().size();

        // Update the drugSynonym using partial update
        DrugSynonym partialUpdatedDrugSynonym = new DrugSynonym();
        partialUpdatedDrugSynonym.setId(drugSynonym.getId());

        partialUpdatedDrugSynonym.name(UPDATED_NAME);

        restDrugSynonymMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDrugSynonym.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDrugSynonym))
            )
            .andExpect(status().isOk());

        // Validate the DrugSynonym in the database
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeUpdate);
        DrugSynonym testDrugSynonym = drugSynonymList.get(drugSynonymList.size() - 1);
        assertThat(testDrugSynonym.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void fullUpdateDrugSynonymWithPatch() throws Exception {
        // Initialize the database
        drugSynonymRepository.saveAndFlush(drugSynonym);

        int databaseSizeBeforeUpdate = drugSynonymRepository.findAll().size();

        // Update the drugSynonym using partial update
        DrugSynonym partialUpdatedDrugSynonym = new DrugSynonym();
        partialUpdatedDrugSynonym.setId(drugSynonym.getId());

        partialUpdatedDrugSynonym.name(UPDATED_NAME);

        restDrugSynonymMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDrugSynonym.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDrugSynonym))
            )
            .andExpect(status().isOk());

        // Validate the DrugSynonym in the database
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeUpdate);
        DrugSynonym testDrugSynonym = drugSynonymList.get(drugSynonymList.size() - 1);
        assertThat(testDrugSynonym.getName()).isEqualTo(UPDATED_NAME);
    }

    @Test
    @Transactional
    void patchNonExistingDrugSynonym() throws Exception {
        int databaseSizeBeforeUpdate = drugSynonymRepository.findAll().size();
        drugSynonym.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDrugSynonymMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, drugSynonym.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drugSynonym))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugSynonym in the database
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDrugSynonym() throws Exception {
        int databaseSizeBeforeUpdate = drugSynonymRepository.findAll().size();
        drugSynonym.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugSynonymMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drugSynonym))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugSynonym in the database
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDrugSynonym() throws Exception {
        int databaseSizeBeforeUpdate = drugSynonymRepository.findAll().size();
        drugSynonym.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugSynonymMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drugSynonym))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DrugSynonym in the database
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDrugSynonym() throws Exception {
        // Initialize the database
        drugSynonymRepository.saveAndFlush(drugSynonym);

        int databaseSizeBeforeDelete = drugSynonymRepository.findAll().size();

        // Delete the drugSynonym
        restDrugSynonymMockMvc
            .perform(delete(ENTITY_API_URL_ID, drugSynonym.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<DrugSynonym> drugSynonymList = drugSynonymRepository.findAll();
        assertThat(drugSynonymList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
