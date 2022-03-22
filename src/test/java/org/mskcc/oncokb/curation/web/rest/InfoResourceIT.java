package org.mskcc.oncokb.curation.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
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
import org.mskcc.oncokb.curation.domain.Info;
import org.mskcc.oncokb.curation.domain.enumeration.InfoType;
import org.mskcc.oncokb.curation.repository.InfoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link InfoResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class InfoResourceIT {

    private static final InfoType DEFAULT_TYPE = InfoType.NCIT_VERSION;
    private static final InfoType UPDATED_TYPE = InfoType.GENE_LAST_UPDATED;

    private static final String DEFAULT_VALUE = "AAAAAAAAAA";
    private static final String UPDATED_VALUE = "BBBBBBBBBB";

    private static final Instant DEFAULT_LAST_UPDATED = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_LAST_UPDATED = Instant.now().truncatedTo(ChronoUnit.MILLIS);

    private static final String ENTITY_API_URL = "/api/infos";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private InfoRepository infoRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restInfoMockMvc;

    private Info info;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Info createEntity(EntityManager em) {
        Info info = new Info().type(DEFAULT_TYPE).value(DEFAULT_VALUE).lastUpdated(DEFAULT_LAST_UPDATED);
        return info;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Info createUpdatedEntity(EntityManager em) {
        Info info = new Info().type(UPDATED_TYPE).value(UPDATED_VALUE).lastUpdated(UPDATED_LAST_UPDATED);
        return info;
    }

    @BeforeEach
    public void initTest() {
        info = createEntity(em);
    }

    @Test
    @Transactional
    void createInfo() throws Exception {
        int databaseSizeBeforeCreate = infoRepository.findAll().size();
        // Create the Info
        restInfoMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(info)))
            .andExpect(status().isCreated());

        // Validate the Info in the database
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeCreate + 1);
        Info testInfo = infoList.get(infoList.size() - 1);
        assertThat(testInfo.getType()).isEqualTo(DEFAULT_TYPE);
        assertThat(testInfo.getValue()).isEqualTo(DEFAULT_VALUE);
        assertThat(testInfo.getLastUpdated()).isEqualTo(DEFAULT_LAST_UPDATED);
    }

    @Test
    @Transactional
    void createInfoWithExistingId() throws Exception {
        // Create the Info with an existing ID
        info.setId(1L);

        int databaseSizeBeforeCreate = infoRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restInfoMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(info)))
            .andExpect(status().isBadRequest());

        // Validate the Info in the database
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTypeIsRequired() throws Exception {
        int databaseSizeBeforeTest = infoRepository.findAll().size();
        // set the field null
        info.setType(null);

        // Create the Info, which fails.

        restInfoMockMvc
            .perform(post(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(info)))
            .andExpect(status().isBadRequest());

        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllInfos() throws Exception {
        // Initialize the database
        infoRepository.saveAndFlush(info);

        // Get all the infoList
        restInfoMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(info.getId().intValue())))
            .andExpect(jsonPath("$.[*].type").value(hasItem(DEFAULT_TYPE.toString())))
            .andExpect(jsonPath("$.[*].value").value(hasItem(DEFAULT_VALUE)))
            .andExpect(jsonPath("$.[*].lastUpdated").value(hasItem(DEFAULT_LAST_UPDATED.toString())));
    }

    @Test
    @Transactional
    void getInfo() throws Exception {
        // Initialize the database
        infoRepository.saveAndFlush(info);

        // Get the info
        restInfoMockMvc
            .perform(get(ENTITY_API_URL_ID, info.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(info.getId().intValue()))
            .andExpect(jsonPath("$.type").value(DEFAULT_TYPE.toString()))
            .andExpect(jsonPath("$.value").value(DEFAULT_VALUE))
            .andExpect(jsonPath("$.lastUpdated").value(DEFAULT_LAST_UPDATED.toString()));
    }

    @Test
    @Transactional
    void getNonExistingInfo() throws Exception {
        // Get the info
        restInfoMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewInfo() throws Exception {
        // Initialize the database
        infoRepository.saveAndFlush(info);

        int databaseSizeBeforeUpdate = infoRepository.findAll().size();

        // Update the info
        Info updatedInfo = infoRepository.findById(info.getId()).get();
        // Disconnect from session so that the updates on updatedInfo are not directly saved in db
        em.detach(updatedInfo);
        updatedInfo.type(UPDATED_TYPE).value(UPDATED_VALUE).lastUpdated(UPDATED_LAST_UPDATED);

        restInfoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedInfo.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedInfo))
            )
            .andExpect(status().isOk());

        // Validate the Info in the database
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeUpdate);
        Info testInfo = infoList.get(infoList.size() - 1);
        assertThat(testInfo.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testInfo.getValue()).isEqualTo(UPDATED_VALUE);
        assertThat(testInfo.getLastUpdated()).isEqualTo(UPDATED_LAST_UPDATED);
    }

    @Test
    @Transactional
    void putNonExistingInfo() throws Exception {
        int databaseSizeBeforeUpdate = infoRepository.findAll().size();
        info.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restInfoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, info.getId())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(info))
            )
            .andExpect(status().isBadRequest());

        // Validate the Info in the database
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchInfo() throws Exception {
        int databaseSizeBeforeUpdate = infoRepository.findAll().size();
        info.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInfoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(info))
            )
            .andExpect(status().isBadRequest());

        // Validate the Info in the database
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamInfo() throws Exception {
        int databaseSizeBeforeUpdate = infoRepository.findAll().size();
        info.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInfoMockMvc
            .perform(put(ENTITY_API_URL).contentType(MediaType.APPLICATION_JSON).content(TestUtil.convertObjectToJsonBytes(info)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Info in the database
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateInfoWithPatch() throws Exception {
        // Initialize the database
        infoRepository.saveAndFlush(info);

        int databaseSizeBeforeUpdate = infoRepository.findAll().size();

        // Update the info using partial update
        Info partialUpdatedInfo = new Info();
        partialUpdatedInfo.setId(info.getId());

        partialUpdatedInfo.type(UPDATED_TYPE).value(UPDATED_VALUE);

        restInfoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedInfo.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedInfo))
            )
            .andExpect(status().isOk());

        // Validate the Info in the database
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeUpdate);
        Info testInfo = infoList.get(infoList.size() - 1);
        assertThat(testInfo.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testInfo.getValue()).isEqualTo(UPDATED_VALUE);
        assertThat(testInfo.getLastUpdated()).isEqualTo(DEFAULT_LAST_UPDATED);
    }

    @Test
    @Transactional
    void fullUpdateInfoWithPatch() throws Exception {
        // Initialize the database
        infoRepository.saveAndFlush(info);

        int databaseSizeBeforeUpdate = infoRepository.findAll().size();

        // Update the info using partial update
        Info partialUpdatedInfo = new Info();
        partialUpdatedInfo.setId(info.getId());

        partialUpdatedInfo.type(UPDATED_TYPE).value(UPDATED_VALUE).lastUpdated(UPDATED_LAST_UPDATED);

        restInfoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedInfo.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedInfo))
            )
            .andExpect(status().isOk());

        // Validate the Info in the database
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeUpdate);
        Info testInfo = infoList.get(infoList.size() - 1);
        assertThat(testInfo.getType()).isEqualTo(UPDATED_TYPE);
        assertThat(testInfo.getValue()).isEqualTo(UPDATED_VALUE);
        assertThat(testInfo.getLastUpdated()).isEqualTo(UPDATED_LAST_UPDATED);
    }

    @Test
    @Transactional
    void patchNonExistingInfo() throws Exception {
        int databaseSizeBeforeUpdate = infoRepository.findAll().size();
        info.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restInfoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, info.getId())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(info))
            )
            .andExpect(status().isBadRequest());

        // Validate the Info in the database
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchInfo() throws Exception {
        int databaseSizeBeforeUpdate = infoRepository.findAll().size();
        info.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInfoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(info))
            )
            .andExpect(status().isBadRequest());

        // Validate the Info in the database
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamInfo() throws Exception {
        int databaseSizeBeforeUpdate = infoRepository.findAll().size();
        info.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restInfoMockMvc
            .perform(patch(ENTITY_API_URL).contentType("application/merge-patch+json").content(TestUtil.convertObjectToJsonBytes(info)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Info in the database
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteInfo() throws Exception {
        // Initialize the database
        infoRepository.saveAndFlush(info);

        int databaseSizeBeforeDelete = infoRepository.findAll().size();

        // Delete the info
        restInfoMockMvc
            .perform(delete(ENTITY_API_URL_ID, info.getId()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<Info> infoList = infoRepository.findAll();
        assertThat(infoList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
