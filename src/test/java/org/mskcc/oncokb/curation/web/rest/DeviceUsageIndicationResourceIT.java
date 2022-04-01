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
import org.mskcc.oncokb.curation.domain.DeviceUsageIndication;
import org.mskcc.oncokb.curation.repository.DeviceUsageIndicationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

/**
 * Integration tests for the {@link DeviceUsageIndicationResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class DeviceUsageIndicationResourceIT {

    private static final String ENTITY_API_URL = "/api/device-usage-indications";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static Random random = new Random();
    private static AtomicLong count = new AtomicLong(random.nextInt() + (2 * Integer.MAX_VALUE));

    @Autowired
    private DeviceUsageIndicationRepository deviceUsageIndicationRepository;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDeviceUsageIndicationMockMvc;

    private DeviceUsageIndication deviceUsageIndication;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DeviceUsageIndication createEntity(EntityManager em) {
        DeviceUsageIndication deviceUsageIndication = new DeviceUsageIndication();
        return deviceUsageIndication;
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DeviceUsageIndication createUpdatedEntity(EntityManager em) {
        DeviceUsageIndication deviceUsageIndication = new DeviceUsageIndication();
        return deviceUsageIndication;
    }

    @BeforeEach
    public void initTest() {
        deviceUsageIndication = createEntity(em);
    }

    @Test
    @Transactional
    void createDeviceUsageIndication() throws Exception {
        int databaseSizeBeforeCreate = deviceUsageIndicationRepository.findAll().size();
        // Create the DeviceUsageIndication
        restDeviceUsageIndicationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(deviceUsageIndication))
            )
            .andExpect(status().isCreated());

        // Validate the DeviceUsageIndication in the database
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeCreate + 1);
        DeviceUsageIndication testDeviceUsageIndication = deviceUsageIndicationList.get(deviceUsageIndicationList.size() - 1);
    }

    @Test
    @Transactional
    void createDeviceUsageIndicationWithExistingId() throws Exception {
        // Create the DeviceUsageIndication with an existing ID
        deviceUsageIndication.setId(1L);

        int databaseSizeBeforeCreate = deviceUsageIndicationRepository.findAll().size();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDeviceUsageIndicationMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(deviceUsageIndication))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeviceUsageIndication in the database
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllDeviceUsageIndications() throws Exception {
        // Initialize the database
        deviceUsageIndicationRepository.saveAndFlush(deviceUsageIndication);

        // Get all the deviceUsageIndicationList
        restDeviceUsageIndicationMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(deviceUsageIndication.getId().intValue())));
    }

    @Test
    @Transactional
    void getDeviceUsageIndication() throws Exception {
        // Initialize the database
        deviceUsageIndicationRepository.saveAndFlush(deviceUsageIndication);

        // Get the deviceUsageIndication
        restDeviceUsageIndicationMockMvc
            .perform(get(ENTITY_API_URL_ID, deviceUsageIndication.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(deviceUsageIndication.getId().intValue()));
    }

    @Test
    @Transactional
    void getNonExistingDeviceUsageIndication() throws Exception {
        // Get the deviceUsageIndication
        restDeviceUsageIndicationMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putNewDeviceUsageIndication() throws Exception {
        // Initialize the database
        deviceUsageIndicationRepository.saveAndFlush(deviceUsageIndication);

        int databaseSizeBeforeUpdate = deviceUsageIndicationRepository.findAll().size();

        // Update the deviceUsageIndication
        DeviceUsageIndication updatedDeviceUsageIndication = deviceUsageIndicationRepository.findById(deviceUsageIndication.getId()).get();
        // Disconnect from session so that the updates on updatedDeviceUsageIndication are not directly saved in db
        em.detach(updatedDeviceUsageIndication);

        restDeviceUsageIndicationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedDeviceUsageIndication.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(updatedDeviceUsageIndication))
            )
            .andExpect(status().isOk());

        // Validate the DeviceUsageIndication in the database
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeUpdate);
        DeviceUsageIndication testDeviceUsageIndication = deviceUsageIndicationList.get(deviceUsageIndicationList.size() - 1);
    }

    @Test
    @Transactional
    void putNonExistingDeviceUsageIndication() throws Exception {
        int databaseSizeBeforeUpdate = deviceUsageIndicationRepository.findAll().size();
        deviceUsageIndication.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDeviceUsageIndicationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, deviceUsageIndication.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(deviceUsageIndication))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeviceUsageIndication in the database
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDeviceUsageIndication() throws Exception {
        int databaseSizeBeforeUpdate = deviceUsageIndicationRepository.findAll().size();
        deviceUsageIndication.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeviceUsageIndicationMockMvc
            .perform(
                put(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(deviceUsageIndication))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeviceUsageIndication in the database
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDeviceUsageIndication() throws Exception {
        int databaseSizeBeforeUpdate = deviceUsageIndicationRepository.findAll().size();
        deviceUsageIndication.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeviceUsageIndicationMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(TestUtil.convertObjectToJsonBytes(deviceUsageIndication))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DeviceUsageIndication in the database
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDeviceUsageIndicationWithPatch() throws Exception {
        // Initialize the database
        deviceUsageIndicationRepository.saveAndFlush(deviceUsageIndication);

        int databaseSizeBeforeUpdate = deviceUsageIndicationRepository.findAll().size();

        // Update the deviceUsageIndication using partial update
        DeviceUsageIndication partialUpdatedDeviceUsageIndication = new DeviceUsageIndication();
        partialUpdatedDeviceUsageIndication.setId(deviceUsageIndication.getId());

        restDeviceUsageIndicationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDeviceUsageIndication.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDeviceUsageIndication))
            )
            .andExpect(status().isOk());

        // Validate the DeviceUsageIndication in the database
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeUpdate);
        DeviceUsageIndication testDeviceUsageIndication = deviceUsageIndicationList.get(deviceUsageIndicationList.size() - 1);
    }

    @Test
    @Transactional
    void fullUpdateDeviceUsageIndicationWithPatch() throws Exception {
        // Initialize the database
        deviceUsageIndicationRepository.saveAndFlush(deviceUsageIndication);

        int databaseSizeBeforeUpdate = deviceUsageIndicationRepository.findAll().size();

        // Update the deviceUsageIndication using partial update
        DeviceUsageIndication partialUpdatedDeviceUsageIndication = new DeviceUsageIndication();
        partialUpdatedDeviceUsageIndication.setId(deviceUsageIndication.getId());

        restDeviceUsageIndicationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDeviceUsageIndication.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(partialUpdatedDeviceUsageIndication))
            )
            .andExpect(status().isOk());

        // Validate the DeviceUsageIndication in the database
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeUpdate);
        DeviceUsageIndication testDeviceUsageIndication = deviceUsageIndicationList.get(deviceUsageIndicationList.size() - 1);
    }

    @Test
    @Transactional
    void patchNonExistingDeviceUsageIndication() throws Exception {
        int databaseSizeBeforeUpdate = deviceUsageIndicationRepository.findAll().size();
        deviceUsageIndication.setId(count.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDeviceUsageIndicationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, deviceUsageIndication.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(deviceUsageIndication))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeviceUsageIndication in the database
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDeviceUsageIndication() throws Exception {
        int databaseSizeBeforeUpdate = deviceUsageIndicationRepository.findAll().size();
        deviceUsageIndication.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeviceUsageIndicationMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, count.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(deviceUsageIndication))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeviceUsageIndication in the database
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDeviceUsageIndication() throws Exception {
        int databaseSizeBeforeUpdate = deviceUsageIndicationRepository.findAll().size();
        deviceUsageIndication.setId(count.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeviceUsageIndicationMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(TestUtil.convertObjectToJsonBytes(deviceUsageIndication))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DeviceUsageIndication in the database
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDeviceUsageIndication() throws Exception {
        // Initialize the database
        deviceUsageIndicationRepository.saveAndFlush(deviceUsageIndication);

        int databaseSizeBeforeDelete = deviceUsageIndicationRepository.findAll().size();

        // Delete the deviceUsageIndication
        restDeviceUsageIndicationMockMvc
            .perform(delete(ENTITY_API_URL_ID, deviceUsageIndication.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        List<DeviceUsageIndication> deviceUsageIndicationList = deviceUsageIndicationRepository.findAll();
        assertThat(deviceUsageIndicationList).hasSize(databaseSizeBeforeDelete - 1);
    }
}
