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
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.DrugBrand;
import org.mskcc.oncokb.curation.repository.DrugBrandRepository;
import org.mskcc.oncokb.curation.service.criteria.DrugBrandCriteria;
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

    private static final String DEFAULT_REGION = "AAAAAAAAAA";
    private static final String UPDATED_REGION = "BBBBBBBBBB";

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
    void checkNameIsRequired() throws Exception {
        int databaseSizeBeforeTest = drugBrandRepository.findAll().size();
        // set the field null
        drugBrand.setName(null);

        // Create the DrugBrand, which fails.

        restDrugBrandMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(drugBrand))
            )
            .andExpect(status().isBadRequest());

        List<DrugBrand> drugBrandList = drugBrandRepository.findAll();
        assertThat(drugBrandList).hasSize(databaseSizeBeforeTest);
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
            .andExpect(jsonPath("$.[*].region").value(hasItem(DEFAULT_REGION)));
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
            .andExpect(jsonPath("$.region").value(DEFAULT_REGION));
    }

    @Test
    @Transactional
    void getDrugBrandsByIdFiltering() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        Long id = drugBrand.getId();

        defaultDrugBrandShouldBeFound("id.equals=" + id);
        defaultDrugBrandShouldNotBeFound("id.notEquals=" + id);

        defaultDrugBrandShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultDrugBrandShouldNotBeFound("id.greaterThan=" + id);

        defaultDrugBrandShouldBeFound("id.lessThanOrEqual=" + id);
        defaultDrugBrandShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllDrugBrandsByNameIsEqualToSomething() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where name equals to DEFAULT_NAME
        defaultDrugBrandShouldBeFound("name.equals=" + DEFAULT_NAME);

        // Get all the drugBrandList where name equals to UPDATED_NAME
        defaultDrugBrandShouldNotBeFound("name.equals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllDrugBrandsByNameIsNotEqualToSomething() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where name not equals to DEFAULT_NAME
        defaultDrugBrandShouldNotBeFound("name.notEquals=" + DEFAULT_NAME);

        // Get all the drugBrandList where name not equals to UPDATED_NAME
        defaultDrugBrandShouldBeFound("name.notEquals=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllDrugBrandsByNameIsInShouldWork() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where name in DEFAULT_NAME or UPDATED_NAME
        defaultDrugBrandShouldBeFound("name.in=" + DEFAULT_NAME + "," + UPDATED_NAME);

        // Get all the drugBrandList where name equals to UPDATED_NAME
        defaultDrugBrandShouldNotBeFound("name.in=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllDrugBrandsByNameIsNullOrNotNull() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where name is not null
        defaultDrugBrandShouldBeFound("name.specified=true");

        // Get all the drugBrandList where name is null
        defaultDrugBrandShouldNotBeFound("name.specified=false");
    }

    @Test
    @Transactional
    void getAllDrugBrandsByNameContainsSomething() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where name contains DEFAULT_NAME
        defaultDrugBrandShouldBeFound("name.contains=" + DEFAULT_NAME);

        // Get all the drugBrandList where name contains UPDATED_NAME
        defaultDrugBrandShouldNotBeFound("name.contains=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllDrugBrandsByNameNotContainsSomething() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where name does not contain DEFAULT_NAME
        defaultDrugBrandShouldNotBeFound("name.doesNotContain=" + DEFAULT_NAME);

        // Get all the drugBrandList where name does not contain UPDATED_NAME
        defaultDrugBrandShouldBeFound("name.doesNotContain=" + UPDATED_NAME);
    }

    @Test
    @Transactional
    void getAllDrugBrandsByRegionIsEqualToSomething() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where region equals to DEFAULT_REGION
        defaultDrugBrandShouldBeFound("region.equals=" + DEFAULT_REGION);

        // Get all the drugBrandList where region equals to UPDATED_REGION
        defaultDrugBrandShouldNotBeFound("region.equals=" + UPDATED_REGION);
    }

    @Test
    @Transactional
    void getAllDrugBrandsByRegionIsNotEqualToSomething() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where region not equals to DEFAULT_REGION
        defaultDrugBrandShouldNotBeFound("region.notEquals=" + DEFAULT_REGION);

        // Get all the drugBrandList where region not equals to UPDATED_REGION
        defaultDrugBrandShouldBeFound("region.notEquals=" + UPDATED_REGION);
    }

    @Test
    @Transactional
    void getAllDrugBrandsByRegionIsInShouldWork() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where region in DEFAULT_REGION or UPDATED_REGION
        defaultDrugBrandShouldBeFound("region.in=" + DEFAULT_REGION + "," + UPDATED_REGION);

        // Get all the drugBrandList where region equals to UPDATED_REGION
        defaultDrugBrandShouldNotBeFound("region.in=" + UPDATED_REGION);
    }

    @Test
    @Transactional
    void getAllDrugBrandsByRegionIsNullOrNotNull() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where region is not null
        defaultDrugBrandShouldBeFound("region.specified=true");

        // Get all the drugBrandList where region is null
        defaultDrugBrandShouldNotBeFound("region.specified=false");
    }

    @Test
    @Transactional
    void getAllDrugBrandsByRegionContainsSomething() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where region contains DEFAULT_REGION
        defaultDrugBrandShouldBeFound("region.contains=" + DEFAULT_REGION);

        // Get all the drugBrandList where region contains UPDATED_REGION
        defaultDrugBrandShouldNotBeFound("region.contains=" + UPDATED_REGION);
    }

    @Test
    @Transactional
    void getAllDrugBrandsByRegionNotContainsSomething() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);

        // Get all the drugBrandList where region does not contain DEFAULT_REGION
        defaultDrugBrandShouldNotBeFound("region.doesNotContain=" + DEFAULT_REGION);

        // Get all the drugBrandList where region does not contain UPDATED_REGION
        defaultDrugBrandShouldBeFound("region.doesNotContain=" + UPDATED_REGION);
    }

    @Test
    @Transactional
    void getAllDrugBrandsByDrugIsEqualToSomething() throws Exception {
        // Initialize the database
        drugBrandRepository.saveAndFlush(drugBrand);
        Drug drug;
        if (TestUtil.findAll(em, Drug.class).isEmpty()) {
            drug = DrugResourceIT.createEntity(em);
            em.persist(drug);
            em.flush();
        } else {
            drug = TestUtil.findAll(em, Drug.class).get(0);
        }
        em.persist(drug);
        em.flush();
        drugBrand.setDrug(drug);
        drugBrandRepository.saveAndFlush(drugBrand);
        Long drugId = drug.getId();

        // Get all the drugBrandList where drug equals to drugId
        defaultDrugBrandShouldBeFound("drugId.equals=" + drugId);

        // Get all the drugBrandList where drug equals to (drugId + 1)
        defaultDrugBrandShouldNotBeFound("drugId.equals=" + (drugId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultDrugBrandShouldBeFound(String filter) throws Exception {
        restDrugBrandMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(drugBrand.getId().intValue())))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].region").value(hasItem(DEFAULT_REGION)));

        // Check, that the count call also returns 1
        restDrugBrandMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultDrugBrandShouldNotBeFound(String filter) throws Exception {
        restDrugBrandMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restDrugBrandMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
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
