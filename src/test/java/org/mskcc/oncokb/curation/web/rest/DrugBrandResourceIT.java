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
import org.mskcc.oncokb.curation.domain.DrugBrand;
import org.mskcc.oncokb.curation.domain.enumeration.GeographicRegion;
import org.mskcc.oncokb.curation.repository.DrugBrandRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link DrugBrandResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class DrugBrandResourceIT {

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final GeographicRegion UPDATED_REGION = GeographicRegion.US;
    private static final GeographicRegion DEFAULT_REGION = GeographicRegion.EU;

    private static final String ENTITY_API_URL = "/api/drug-brands";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private DrugBrandRepository drugBrandRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDrugBrandMockMvc;

    private DrugBrand drugBrand;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DrugBrand createEntity(EntityManager em) {
        DrugBrand drugBrand = new DrugBrand().name(DEFAULT_NAME).region(DEFAULT_REGION);
        return drugBrand;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DrugBrand createUpdatedEntity(EntityManager em) {
        DrugBrand drugBrand = new DrugBrand().name(UPDATED_NAME).region(UPDATED_REGION);
        return drugBrand;
    }

    @BeforeEach
    public void initTest() {
        drugBrand = createEntity(em);
    }

    @Test
    @Transactional
    void createDrugBrand() throws Exception {
        int databaseSizeBeforeCreate = drugBrandRepository.findAll().size();
        // Create the DrugBrand
        restDrugBrandMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugBrand))
            )
            .andExpect(status().isCreated());

        // Validate the DrugBrand in the database
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeCreate + 1);
        DrugBrand testDrugBrand = drugBrandList.get(drugBrandList.size() - 1);
        assertThat(testDrugBrand.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testDrugBrand.getRegion()).isEqualTo(DEFAULT_REGION);
    }

    @Test
    @Transactional
    void createDrugBrandWithExistingId() throws Exception {
        // Create the DrugBrand with an existing ID
        drugBrand.setId(1L);

        int databaseSizeBeforeCreate = drugBrandRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDrugBrandMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugBrand))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugBrand in the database
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllDrugBrands() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList
        restDrugBrandMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(drugBrand.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].region").value(hasItem(DEFAULT_REGION.toString())));
    }

    @Test
    @Transactional
    void getDrugBrand() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get the drugBrand
        restDrugBrandMockMvc
            .perform(get(ENTITY_API_URL_ID, drugBrand.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(drugBrand.getId().intValue()))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.region").value(DEFAULT_REGION.toString()));
    }

    @Test
    @Transactional
    void getNonExistingDrugBrand() throws Exception {
        // Get the drugBrand
        restDrugBrandMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewDrugBrand() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        int databaseSizeBeforeUpdate = drugBrandRepository.findAll().size();

        // Update the drugBrand
        DrugBrand updatedDrugBrand = drugBrandRepository.findById(drugBrand.getId()).get();
        // Disconnect from session so that the updates on updatedDrugBrand are not directly saved in db
        em.detach(updatedDrugBrand);
        updatedDrugBrand.name(UPDATED_NAME).region(UPDATED_REGION);

        restDrugBrandMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedDrugBrand.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedDrugBrand))
            )
            .andExpect(status().isOk());

        // Validate the DrugBrand in the database
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeUpdate);
        DrugBrand testDrugBrand = drugBrandList.get(drugBrandList.size() - 1);
        assertThat(testDrugBrand.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testDrugBrand.getRegion()).isEqualTo(UPDATED_REGION);
    }

    @Test
    @Transactional
    void putNonExistingDrugBrand() throws Exception {
        int databaseSizeBeforeUpdate = drugBrandRepository.findAll().size();
        drugBrand.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDrugBrandMockMvc
            .perform(
                put(ENTITY_API_URL_ID, drugBrand.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugBrand))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugBrand in the database
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDrugBrand() throws Exception {
        int databaseSizeBeforeUpdate = drugBrandRepository.findAll().size();
        drugBrand.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugBrandMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugBrand))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugBrand in the database
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDrugBrand() throws Exception {
        int databaseSizeBeforeUpdate = drugBrandRepository.findAll().size();
        drugBrand.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugBrandMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugBrand))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DrugBrand in the database
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDrugBrandWithPatch() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        int databaseSizeBeforeUpdate = drugBrandRepository.findAll().size();

        // Update the drugBrand using partial update
        DrugBrand partialUpdatedDrugBrand = new DrugBrand();
        partialUpdatedDrugBrand.setId(drugBrand.getId());

        restDrugBrandMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDrugBrand.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDrugBrand))
            )
            .andExpect(status().isOk());

        // Validate the DrugBrand in the database
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeUpdate);
        DrugBrand testDrugBrand = drugBrandList.get(drugBrandList.size() - 1);
        assertThat(testDrugBrand.getName()).isEqualTo(DEFAULT_NAME);
        assertThat(testDrugBrand.getRegion()).isEqualTo(DEFAULT_REGION);
    }

    @Test
    @Transactional
    void fullUpdateDrugBrandWithPatch() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        int databaseSizeBeforeUpdate = drugBrandRepository.findAll().size();

        // Update the drugBrand using partial update
        DrugBrand partialUpdatedDrugBrand = new DrugBrand();
        partialUpdatedDrugBrand.setId(drugBrand.getId());

        partialUpdatedDrugBrand.name(UPDATED_NAME).region(UPDATED_REGION);

        restDrugBrandMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDrugBrand.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDrugBrand))
            )
            .andExpect(status().isOk());

        // Validate the DrugBrand in the database
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeUpdate);
        DrugBrand testDrugBrand = drugBrandList.get(drugBrandList.size() - 1);
        assertThat(testDrugBrand.getName()).isEqualTo(UPDATED_NAME);
        assertThat(testDrugBrand.getRegion()).isEqualTo(UPDATED_REGION);
    }

    @Test
    @Transactional
    void patchNonExistingDrugBrand() throws Exception {
        int databaseSizeBeforeUpdate = drugBrandRepository.findAll().size();
        drugBrand.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDrugBrandMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, drugBrand.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drugBrand))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugBrand in the database
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDrugBrand() throws Exception {
        int databaseSizeBeforeUpdate = drugBrandRepository.findAll().size();
        drugBrand.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugBrandMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drugBrand))
            )
            .andExpect(status().isBadRequest());

        // Validate the DrugBrand in the database
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDrugBrand() throws Exception {
        int databaseSizeBeforeUpdate = drugBrandRepository.findAll().size();
        drugBrand.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDrugBrandMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(drugBrand))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DrugBrand in the database
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDrugBrand() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        int databaseSizeBeforeDelete = drugBrandRepository.findAll().size();

        // Delete the drugBrand
        restDrugBrandMockMvc
            .perform(delete(ENTITY_API_URL_ID, drugBrand.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
