package org.mskcc.oncokb.curation.web.rest;

import static org.mskcc.oncokb.curation.config.Constants.ONCOKB_PUBLIC_API_URL;

import com.google.cloud.storage.HttpMethod;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collection;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.javers.core.Javers;
import org.javers.core.metamodel.object.CdoSnapshot;
import org.javers.core.metamodel.object.CdoSnapshotState;
import org.javers.core.metamodel.object.InstanceId;
import org.javers.repository.jql.QueryBuilder;
import org.mskcc.oncokb.curation.domain.Flag;
import org.mskcc.oncokb.curation.domain.enumeration.AuditEntity;
import org.mskcc.oncokb.curation.domain.enumeration.FlagType;
import org.mskcc.oncokb.curation.service.FlagService;
import org.mskcc.oncokb.curation.service.OncoKbUrlService;
import org.mskcc.oncokb.curation.service.dto.EntityAuditEvent;
import org.oncokb.ApiException;
import org.oncokb.client.OncoKBInfo;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;

/**
 * REST controller for getting the audit events for entity
 */
@RestController
@RequestMapping("/api")
public class AuditResource {

    private final Logger log = LoggerFactory.getLogger(AuditResource.class);
    private static final String ENTITY_PACKAGE_PATH = "org.mskcc.oncokb.curation.domain.";

    @Autowired
    private OncoKbUrlService oncoKbUrlService;

    @Autowired
    private FlagService flagService;

    private final Javers javers;

    public AuditResource(Javers javers) {
        this.javers = javers;
    }

    /**
     * Fetches all the audited entity types
     *
     * @return a full of the entity types
     */
    @RequestMapping(value = "/audits/entity/all", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public List<String> getAuditedEntities() {
        return Arrays.stream(AuditEntity.values()).map(AuditEntity::getClassName).collect(Collectors.toList());
    }

    /**
     * Fetches the last 100 change list for an entity class, if limit is passed fetches that many changes
     *
     * @param entityType  One of the AuditEntity types
     * @param limit       number of records to return
     * @param queryParams pagination parameters
     * @return a list of entity audit events
     */
    @RequestMapping(value = "/audits/entity/changes", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<EntityAuditEvent>> getChanges(
        @RequestParam(value = "entityType") String entityType,
        @RequestParam(value = "limit") int limit,
        @RequestParam MultiValueMap<String, String> queryParams,
        UriComponentsBuilder uriBuilder
    ) throws ClassNotFoundException {
        log.debug("REST request to get a page of EntityAuditEvents");

        Class<?> entityTypeToFetch = Class.forName(ENTITY_PACKAGE_PATH + entityType);
        QueryBuilder jqlQuery = QueryBuilder.byClass(entityTypeToFetch).limit(limit);

        List<CdoSnapshot> snapshots = javers.findSnapshots(jqlQuery.build());

        List<EntityAuditEvent> auditEvents = new ArrayList<>();

        snapshots.forEach(snapshot -> {
            EntityAuditEvent event = EntityAuditEvent.fromJaversSnapshot(snapshot);
            event.setEntityType(entityType);
            auditEvents.add(event);
        });

        Page<EntityAuditEvent> page = new PageImpl<>(auditEvents);

        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(uriBuilder.queryParams(queryParams), page);

        return new ResponseEntity<>(page.getContent(), headers, HttpStatus.OK);
    }

    /**
     * Fetches a previous version for an entity class, id and commit id
     *
     * @param entityType One of the AuditEntity types
     * @param entityId   unique id in the selected entity table
     * @param commitId   the commit id that audit table uses
     * @return previous audit event. Return empty if nothing found.
     */
    @RequestMapping(
        value = "/audits/entity/changes/version/previous",
        method = RequestMethod.GET,
        produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<EntityAuditEvent> getPrevVersion(
        @RequestParam(value = "entityType") String entityType,
        @RequestParam(value = "entityId") Integer entityId,
        @RequestParam(value = "commitId") Long commitId
    ) throws ClassNotFoundException {
        Class entityTypeToFetch = Class.forName(ENTITY_PACKAGE_PATH + entityType);

        // Find the commit
        QueryBuilder jqlQuery = QueryBuilder.byInstanceId(entityId, entityTypeToFetch).withCommitId(BigDecimal.valueOf(commitId)).limit(1);

        // Since we use random commit id, we need to find the list of commits that prior to the commitId
        List<CdoSnapshot> snapshots = javers.findSnapshots(jqlQuery.build());
        if (snapshots.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // Return the previous one of commitId
        CdoSnapshot cdoSnapshot = snapshots.iterator().next();
        jqlQuery = QueryBuilder.byInstanceId(entityId, entityTypeToFetch).to(cdoSnapshot.getCommitMetadata().getCommitDate()).limit(2);
        snapshots = javers.findSnapshots(jqlQuery.build());
        if (snapshots.size() == 2) {
            return new ResponseEntity<>(EntityAuditEvent.fromJaversSnapshot(snapshots.get(1)), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.OK);
        }
    }

    /**
     * Fetches all newly released somatic genes (germline TBD)
     */
    @RequestMapping(value = "/audits/entity/genes/newly-released", method = RequestMethod.GET, produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<String>> getNewlyReleasedGenes() throws ClassNotFoundException, ApiException {
        Class geneEntityClass = Class.forName(ENTITY_PACKAGE_PATH + AuditEntity.GENE.getClassName());

        // Get the latest OncoKB date of release
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MM/dd/yyyy");
        LocalDate localDate = LocalDate.parse(oncoKbUrlService.getInfo().getDataVersion().getDate(), formatter);

        // Get the flag id of the somatic flag (germline TBD)
        Optional<Flag> optionalFlag = flagService.findByTypeAndFlag(FlagType.GENE_PANEL, "ONCOKB_SOMATIC");
        Long flagId = optionalFlag.orElseThrow().getId();

        QueryBuilder jqlQuery = QueryBuilder.byClass(geneEntityClass).withChangedProperty("flags").from(localDate);

        List<CdoSnapshot> snapshots = javers.findSnapshots(jqlQuery.build());

        // Extract hugoSymbols where flag changes include the target release flag id
        List<String> hugoSymbols = snapshots
            .stream()
            .map(snapshot -> snapshot.getState())
            .filter(snapshotState -> {
                Collection<InstanceId> flags = (Collection<InstanceId>) snapshotState.getPropertyValue("flags");
                return flags != null && flags.stream().anyMatch(flag -> flagId.equals(flag.getCdoId()));
            })
            .map(snapshotState -> (String) snapshotState.getPropertyValue("hugoSymbol"))
            .filter(hugoSymbol -> StringUtils.isNotEmpty(hugoSymbol))
            .distinct()
            .collect(Collectors.toList());

        return new ResponseEntity<>(hugoSymbols, HttpStatus.OK);
    }
}
