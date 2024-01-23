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
import org.mskcc.oncokb.curation.domain.Drug;
import org.mskcc.oncokb.curation.domain.DrugBrand;
import org.mskcc.oncokb.curation.domain.DrugPriority;
import org.mskcc.oncokb.curation.domain.FdaDrug;
import org.mskcc.oncokb.curation.domain.Flag;
import org.mskcc.oncokb.curation.domain.NciThesaurus;
import org.mskcc.oncokb.curation.domain.Treatment;
import org.mskcc.oncokb.curation.repository.DrugRepository;
import org.mskcc.oncokb.curation.service.DrugService;
import org.mskcc.oncokb.curation.service.criteria.DrugCriteria;
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

    private static final String DEFAULT_UUID = "AAAAAAAAAA";
    private static final String UPDATED_UUID = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/drugs";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private DrugRepository drugRepository;

    @Mock
    private DrugRepository drugRepositoryMock;

    @Mock
    private DrugService drugServiceMock;

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
        Drug drug = new Drug().uuid(DEFAULT_UUID).name(DEFAULT_NAME);
        return drug;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Drug createUpdatedEntity(EntityManager em) {
        Drug drug = new Drug().uuid(UPDATED_UUID).name(UPDATED_NAME);
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
        assertThat(testDrug.getUuid()).isEqualTo(DEFAULT_UUID);
        assertThat(testDrug.getName()).isEqualTo(DEFAULT_NAME);
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
    }

    @Test
    @Transactional
    void checkUuidIsRequired() throws Exception {
        int databaseSizeBeforeTest = drugRepository.findAll().size();
        // set the field null
        drug.setUuid(null);

        // Create the Drug, which fails.

        restDrugMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(drug))
            )
            .andExpect(status().isBadRequest());

        List<Drug> drugList = drugRepository.findAll();
        assertThat(drugList).hasSize(databaseSizeBeforeTest);
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
            .andExpect(jsonPath("$.[*].uuid").value(hasItem(DEFAULT_UUID)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())));
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
            .andExpect(jsonPath("$.uuid").value(DEFAULT_UUID))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME.toString()));
    }

    @Test
    @Transactional
    void getDrugsByIdFiltering() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        Long id = drug.getId();

        defaultDrugShouldBeFound("id.equals=" + id);
        defaultDrugShouldNotBeFound("id.notEquals=" + id);

        defaultDrugShouldBeFound("id.greaterThanOrEqual=" + id);
        defaultDrugShouldNotBeFound("id.greaterThan=" + id);

        defaultDrugShouldBeFound("id.lessThanOrEqual=" + id);
        defaultDrugShouldNotBeFound("id.lessThan=" + id);
    }

    @Test
    @Transactional
    void getAllDrugsByUuidIsEqualToSomething() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        // Get all the drugList where uuid equals to DEFAULT_UUID
        defaultDrugShouldBeFound("uuid.equals=" + DEFAULT_UUID);

        // Get all the drugList where uuid equals to UPDATED_UUID
        defaultDrugShouldNotBeFound("uuid.equals=" + UPDATED_UUID);
    }

    @Test
    @Transactional
    void getAllDrugsByUuidIsNotEqualToSomething() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        // Get all the drugList where uuid not equals to DEFAULT_UUID
        defaultDrugShouldNotBeFound("uuid.notEquals=" + DEFAULT_UUID);

        // Get all the drugList where uuid not equals to UPDATED_UUID
        defaultDrugShouldBeFound("uuid.notEquals=" + UPDATED_UUID);
    }

    @Test
    @Transactional
    void getAllDrugsByUuidIsInShouldWork() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        // Get all the drugList where uuid in DEFAULT_UUID or UPDATED_UUID
        defaultDrugShouldBeFound("uuid.in=" + DEFAULT_UUID + "," + UPDATED_UUID);

        // Get all the drugList where uuid equals to UPDATED_UUID
        defaultDrugShouldNotBeFound("uuid.in=" + UPDATED_UUID);
    }

    @Test
    @Transactional
    void getAllDrugsByUuidIsNullOrNotNull() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        // Get all the drugList where uuid is not null
        defaultDrugShouldBeFound("uuid.specified=true");

        // Get all the drugList where uuid is null
        defaultDrugShouldNotBeFound("uuid.specified=false");
    }

    @Test
    @Transactional
    void getAllDrugsByUuidContainsSomething() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        // Get all the drugList where uuid contains DEFAULT_UUID
        defaultDrugShouldBeFound("uuid.contains=" + DEFAULT_UUID);

        // Get all the drugList where uuid contains UPDATED_UUID
        defaultDrugShouldNotBeFound("uuid.contains=" + UPDATED_UUID);
    }

    @Test
    @Transactional
    void getAllDrugsByUuidNotContainsSomething() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);

        // Get all the drugList where uuid does not contain DEFAULT_UUID
        defaultDrugShouldNotBeFound("uuid.doesNotContain=" + DEFAULT_UUID);

        // Get all the drugList where uuid does not contain UPDATED_UUID
        defaultDrugShouldBeFound("uuid.doesNotContain=" + UPDATED_UUID);
    }

    @Test
    @Transactional
    void getAllDrugsByNciThesaurusIsEqualToSomething() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);
        NciThesaurus nciThesaurus;
        if (TestUtil.findAll(em, NciThesaurus.class).isEmpty()) {
            nciThesaurus = NciThesaurusResourceIT.createEntity(em);
            em.persist(nciThesaurus);
            em.flush();
        } else {
            nciThesaurus = TestUtil.findAll(em, NciThesaurus.class).get(0);
        }
        em.persist(nciThesaurus);
        em.flush();
        drug.setNciThesaurus(nciThesaurus);
        drugRepository.saveAndFlush(drug);
        Long nciThesaurusId = nciThesaurus.getId();

        // Get all the drugList where nciThesaurus equals to nciThesaurusId
        defaultDrugShouldBeFound("nciThesaurusId.equals=" + nciThesaurusId);

        // Get all the drugList where nciThesaurus equals to (nciThesaurusId + 1)
        defaultDrugShouldNotBeFound("nciThesaurusId.equals=" + (nciThesaurusId + 1));
    }

    @Test
    @Transactional
    void getAllDrugsByBrandsIsEqualToSomething() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);
        DrugBrand brands;
        if (TestUtil.findAll(em, DrugBrand.class).isEmpty()) {
            brands = DrugBrandResourceIT.createEntity(em);
            em.persist(brands);
            em.flush();
        } else {
            brands = TestUtil.findAll(em, DrugBrand.class).get(0);
        }
        em.persist(brands);
        em.flush();
        drug.addBrands(brands);
        drugRepository.saveAndFlush(drug);
        Long brandsId = brands.getId();

        // Get all the drugList where brands equals to brandsId
        defaultDrugShouldBeFound("brandsId.equals=" + brandsId);

        // Get all the drugList where brands equals to (brandsId + 1)
        defaultDrugShouldNotBeFound("brandsId.equals=" + (brandsId + 1));
    }

    @Test
    @Transactional
    void getAllDrugsByDrugPriorityIsEqualToSomething() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);
        DrugPriority drugPriority;
        if (TestUtil.findAll(em, DrugPriority.class).isEmpty()) {
            drugPriority = DrugPriorityResourceIT.createEntity(em);
            em.persist(drugPriority);
            em.flush();
        } else {
            drugPriority = TestUtil.findAll(em, DrugPriority.class).get(0);
        }
        em.persist(drugPriority);
        em.flush();
        drug.addDrugPriority(drugPriority);
        drugRepository.saveAndFlush(drug);
        Long drugPriorityId = drugPriority.getId();

        // Get all the drugList where drugPriority equals to drugPriorityId
        defaultDrugShouldBeFound("drugPriorityId.equals=" + drugPriorityId);

        // Get all the drugList where drugPriority equals to (drugPriorityId + 1)
        defaultDrugShouldNotBeFound("drugPriorityId.equals=" + (drugPriorityId + 1));
    }

    @Test
    @Transactional
    void getAllDrugsByFlagIsEqualToSomething() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);
        Flag flag;
        if (TestUtil.findAll(em, Flag.class).isEmpty()) {
            flag = FlagResourceIT.createEntity(em);
            em.persist(flag);
            em.flush();
        } else {
            flag = TestUtil.findAll(em, Flag.class).get(0);
        }
        em.persist(flag);
        em.flush();
        drug.addFlag(flag);
        drugRepository.saveAndFlush(drug);
        Long flagId = flag.getId();

        // Get all the drugList where flag equals to flagId
        defaultDrugShouldBeFound("flagId.equals=" + flagId);

        // Get all the drugList where flag equals to (flagId + 1)
        defaultDrugShouldNotBeFound("flagId.equals=" + (flagId + 1));
    }

    @Test
    @Transactional
    void getAllDrugsByFdaDrugIsEqualToSomething() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);
        FdaDrug fdaDrug;
        if (TestUtil.findAll(em, FdaDrug.class).isEmpty()) {
            fdaDrug = FdaDrugResourceIT.createEntity(em);
            em.persist(fdaDrug);
            em.flush();
        } else {
            fdaDrug = TestUtil.findAll(em, FdaDrug.class).get(0);
        }
        em.persist(fdaDrug);
        em.flush();
        drug.setFdaDrug(fdaDrug);
        fdaDrug.setDrug(drug);
        drugRepository.saveAndFlush(drug);
        Long fdaDrugId = fdaDrug.getId();

        // Get all the drugList where fdaDrug equals to fdaDrugId
        defaultDrugShouldBeFound("fdaDrugId.equals=" + fdaDrugId);

        // Get all the drugList where fdaDrug equals to (fdaDrugId + 1)
        defaultDrugShouldNotBeFound("fdaDrugId.equals=" + (fdaDrugId + 1));
    }

    @Test
    @Transactional
    void getAllDrugsByTreatmentIsEqualToSomething() throws Exception {
        // Initialize the database
        drugRepository.saveAndFlush(drug);
        Treatment treatment;
        if (TestUtil.findAll(em, Treatment.class).isEmpty()) {
            treatment = TreatmentResourceIT.createEntity(em);
            em.persist(treatment);
            em.flush();
        } else {
            treatment = TestUtil.findAll(em, Treatment.class).get(0);
        }
        em.persist(treatment);
        em.flush();
        drug.addTreatment(treatment);
        drugRepository.saveAndFlush(drug);
        Long treatmentId = treatment.getId();

        // Get all the drugList where treatment equals to treatmentId
        defaultDrugShouldBeFound("treatmentId.equals=" + treatmentId);

        // Get all the drugList where treatment equals to (treatmentId + 1)
        defaultDrugShouldNotBeFound("treatmentId.equals=" + (treatmentId + 1));
    }

    /**
     * Executes the search, and checks that the default entity is returned.
     */
    private void defaultDrugShouldBeFound(String filter) throws Exception {
        restDrugMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(drug.getId().intValue())))
            .andExpect(jsonPath("$.[*].uuid").value(hasItem(DEFAULT_UUID)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME.toString())));

        // Check, that the count call also returns 1
        restDrugMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("1"));
    }

    /**
     * Executes the search, and checks that the default entity is not returned.
     */
    private void defaultDrugShouldNotBeFound(String filter) throws Exception {
        restDrugMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$").isArray())
            .andExpect(jsonPath("$").isEmpty());

        // Check, that the count call also returns 0
        restDrugMockMvc
            .perform(get(ENTITY_API_URL + "/count?sort=id,desc&" + filter))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(content().string("0"));
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
        updatedDrug.uuid(UPDATED_UUID).name(UPDATED_NAME);

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
        assertThat(testDrug.getUuid()).isEqualTo(UPDATED_UUID);
        assertThat(testDrug.getName()).isEqualTo(UPDATED_NAME);
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

        partialUpdatedDrug.uuid(UPDATED_UUID);

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
        assertThat(testDrug.getUuid()).isEqualTo(UPDATED_UUID);
        assertThat(testDrug.getName()).isEqualTo(DEFAULT_NAME);
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

        partialUpdatedDrug.uuid(UPDATED_UUID).name(UPDATED_NAME);

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
        assertThat(testDrug.getUuid()).isEqualTo(UPDATED_UUID);
        assertThat(testDrug.getName()).isEqualTo(UPDATED_NAME);
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
    }
}
