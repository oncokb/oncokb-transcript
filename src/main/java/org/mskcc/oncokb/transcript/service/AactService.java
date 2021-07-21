package org.mskcc.oncokb.transcript.service;

import fr.dudie.nominatim.client.JsonNominatimClient;
import fr.dudie.nominatim.client.NominatimOptions;
import fr.dudie.nominatim.client.request.ExtendedSearchQuery;
import fr.dudie.nominatim.client.request.NominatimReverseRequest;
import fr.dudie.nominatim.client.request.NominatimSearchRequest;
import fr.dudie.nominatim.model.Address;
import fr.dudie.nominatim.model.Element;
import java.io.IOException;
import java.sql.*;
import java.util.*;
import java.util.stream.Collectors;
import jodd.util.StringUtil;
import org.apache.commons.lang3.math.NumberUtils;
import org.apache.http.client.HttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.mskcc.oncokb.transcript.OncokbTranscriptApp;
import org.mskcc.oncokb.transcript.config.ApplicationProperties;
import org.mskcc.oncokb.transcript.config.model.AactConfig;
import org.mskcc.oncokb.transcript.domain.Site;
import org.mskcc.oncokb.transcript.service.aws.models.Coordinates;
import org.mskcc.oncokb.transcript.util.PostalTranslationsUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.parameters.P;
import org.springframework.stereotype.Service;

@Service
public class AactService {

    private static final Logger log = LoggerFactory.getLogger(OncokbTranscriptApp.class);

    ApplicationProperties applicationProperties;
    AwsService awsService;
    SiteService siteService;
    JsonNominatimClient jsonNominatimClient;

    final String AACT_URL = "aact-db.ctti-clinicaltrials.org";
    final int AACT_PORT = 5432;
    final String AACT_DB_NAME = "aact";
    final String AACT_CONNECTION_STR = "jdbc:postgresql://" + AACT_URL + ":" + AACT_PORT + "/" + AACT_DB_NAME;

    public AactService(ApplicationProperties applicationProperties, AwsService awsService, SiteService siteService) throws Exception {
        this.applicationProperties = applicationProperties;
        this.awsService = awsService;
        this.siteService = siteService;

        HttpClient httpClient = HttpClientBuilder.create().build();
        NominatimOptions nominatimOptions = new NominatimOptions();
        nominatimOptions.setAcceptLanguage(Locale.ENGLISH);
        this.jsonNominatimClient = new JsonNominatimClient(httpClient, "dev@oncokb.org", nominatimOptions);
    }

    private Connection getAactConnection() throws Exception {
        AactConfig aactConfig = applicationProperties.getAact();
        if (StringUtil.isNotEmpty(aactConfig.getUsername()) && StringUtil.isNotEmpty(aactConfig.getPassword())) {
            try {
                return DriverManager.getConnection(AACT_CONNECTION_STR, aactConfig.getUsername(), aactConfig.getPassword());
            } catch (SQLException throwables) {
                throwables.printStackTrace();
                throw new Exception("AACT Connection Error", throwables);
            }
        } else {
            throw new Exception("AACT u/p need to be added.");
        }
    }

    public void fetchLatestTrials() throws Exception {
        // Step 1 - Get a list of cancer related mesh terms, qualifier C04
        //        Set<String> meshTerms = getMeshTerms();

        //        Set<String> filteredTerms = meshTerms.stream().filter(meshTerm -> meshTerm.contains(",")).collect(Collectors.toSet());
        // Step 2 - Get a list of NCT IDs from browse_conditions where mesh_term comes from the step 1
        //        Set<String> nctIds = getNctIdsByMeshTerms(filteredTerms);

        // Step 3 - Get the trials using the list above
        //        getTrials(nctIds);

        // Step 4 - Get interventions -> arm

        /*
        select dg.id, dg.nct_id, i.id, i.intervention_type, i.name
        from design_group_interventions dgi,
             design_groups dg,
             interventions i
        where dgi.design_group_id = dg.id
          and i.id = dgi.intervention_id
          and dg.nct_id = 'NCT02465060';
        */

        // Step 5 - Get sites
        // We need to use openstreetmap to get he coordinates if the site is not in the database
        importAwsSites();
        //        getSites(nctIds);
        validateSites();
        // Step 6 - Update info table
    }

    private Set<String> getMeshTerms() throws Exception {
        Statement stm = getAactConnection().createStatement();
        ResultSet resultSet = stm.executeQuery("select mesh_term from mesh_terms where qualifier='C04'");

        Set<String> meshTerms = new HashSet<>();
        while (resultSet.next()) {
            String meshTerm = resultSet.getString("MESH_TERM");
            if (StringUtil.isNotEmpty(meshTerm)) {
                meshTerms.add(meshTerm);
            }
        }
        resultSet.close();
        stm.close();
        return meshTerms;
    }

    private Set<String> getNctIdsByMeshTerms(Set<String> meshTerms) throws Exception {
        Statement stm = getAactConnection().createStatement();

        meshTerms = new HashSet<>(wrapSqlStringInClause(new ArrayList<>(meshTerms)));

        String NCT_ID_KEY = "NCT_ID";
        String query = "select distinct " + NCT_ID_KEY + " from browse_conditions where mesh_term in (" + String.join(",", meshTerms) + ")";
        ResultSet resultSet = stm.executeQuery(query);

        Set<String> trials = new HashSet<>();
        while (resultSet.next()) {
            String trialId = resultSet.getString(NCT_ID_KEY);
            if (StringUtil.isNotEmpty(trialId)) {
                trials.add(trialId);
            }
        }
        resultSet.close();
        stm.close();
        return trials;
    }

    private Set<String> getTrials(Set<String> nctIds) throws Exception {
        Statement stm = getAactConnection().createStatement();
        String NCT_ID_KEY = "NCT_ID";
        String STUDY_TYPE_KEY = "STUDY_TYPE";
        String BRIEF_TITLE_KEY = "BRIEF_TITLE";
        String OVERALL_STATUS_KEY = "OVERALL_STATUS";
        String LAST_KNOWN_STATUS_KEY = "LAST_KNOWN_STATUS";
        String PHASE_KEY = "PHASE";
        String[] keys = new String[] { NCT_ID_KEY, STUDY_TYPE_KEY, BRIEF_TITLE_KEY, OVERALL_STATUS_KEY, LAST_KNOWN_STATUS_KEY, PHASE_KEY };
        ResultSet resultSet = stm.executeQuery(
            "select " +
            String.join(",", keys) +
            " from studies where nct_id in (" +
            String.join(",", wrapSqlStringInClause(new ArrayList<>(nctIds))) +
            ")"
        );

        Set<String> trials = new HashSet<>();
        while (resultSet.next()) {
            String trialId = resultSet.getString(NCT_ID_KEY);
            if (StringUtil.isNotEmpty(trialId)) {
                trials.add(trialId);
            }
        }
        resultSet.close();
        stm.close();
        return trials;
    }

    private String getCoordinatesString(Coordinates coordinates) {
        if (coordinates == null) {
            return "";
        }
        return coordinates.getLat() + "," + coordinates.getLon();
    }

    private void importAwsSites() {
        Set<org.mskcc.oncokb.transcript.service.aws.models.Site> awsSites = this.awsService.getClinicalTrialSites();
        awsSites.forEach(
            awsSite -> {
                Optional<Site> siteOptional = Optional.empty();
                if (awsSite.getCoordinates() != null) {
                    String coordinates = getCoordinatesString(awsSite.getCoordinates());
                    siteOptional = siteService.findOneByCoordinates(coordinates);
                } else {
                    siteOptional = siteService.findOneByNameAndCityAndCountry(awsSite.getName(), awsSite.getCity(), awsSite.getCountry());
                }
                if (siteOptional.isEmpty()) {
                    Site site = new Site();
                    site.setCoordinates(getCoordinatesString(awsSite.getCoordinates()));
                    site.setAddress(awsSite.getAddress());
                    site.setName(awsSite.getName());
                    site.setCity(awsSite.getCity());
                    String stateFullName = PostalTranslationsUtils.getStateNameFromAbbreviation(awsSite.getState());
                    if (StringUtil.isEmpty(stateFullName)) {
                        site.setState(awsSite.getState());
                    } else {
                        site.setState(stateFullName);
                    }
                    site.setCountry(awsSite.getCountry());
                    siteService.save(site);
                }
            }
        );
    }

    private void getSites(Set<String> nctIds) throws Exception {
        String nctIdList = String.join(",", wrapSqlStringInClause(new ArrayList<>(nctIds)));
        Statement stm = getAactConnection().createStatement();
        ResultSet resultSet = stm.executeQuery(
            "select f.nct_id as \"nct_id\", f.name as \"name\", f.city as \"city\", f.state as \"state\", f.zip as \"zip\", f.country as \"country\", fi.name as \"pi_name\", fc.email as \"pi_email\", fc.phone as \"pi_phone\"\n" +
            "        from facilities f,\n" +
            "             facility_contacts fc,\n" +
            "             facility_investigators fi\n" +
            "        where f.id = fc.facility_id\n" +
            "          and f.id = fi.facility_id\n" +
            "          and fc.contact_type = 'primary'\n" +
            "          and f.nct_id in (" +
            nctIdList +
            ")"
        );

        Set<String> trials = new HashSet<>();
        while (resultSet.next()) {
            List<String> queryParams = new ArrayList<>();

            String fName = resultSet.getString("name");

            String city = resultSet.getString("city");

            String state = resultSet.getString("state");

            String country = Optional.ofNullable(resultSet.getString("country")).orElse("");

            Optional<Site> siteOptional = siteService.findOneByNameAndCityAndCountry(fName, city, country);
            if (siteOptional.isEmpty()) {
                ExtendedSearchQuery searchQuery = new ExtendedSearchQuery();
                String zip = Optional.ofNullable(resultSet.getString("zip")).orElse("");
                if (country.equals("United States")) {
                    zip = zip.split("-")[0];
                }
                zip = zip.trim();
                if (NumberUtils.isCreatable(zip)) {
                    searchQuery.setPostalCode(zip);
                } else {
                    if (StringUtil.isNotEmpty(country)) {
                        searchQuery.setCountry(country);
                    }
                    if (StringUtil.isNotEmpty(state)) {
                        searchQuery.setState(state);
                    }
                    if (StringUtil.isNotEmpty(city)) {
                        searchQuery.setCity(city);
                    }
                }
                NominatimSearchRequest nominatimSearchRequest = new NominatimSearchRequest();
                nominatimSearchRequest.setQuery(searchQuery);
                List<Address> addresses = this.jsonNominatimClient.search(nominatimSearchRequest);
                Site site = new Site();
                site.setCountry(country);
                site.setCity(city);
                site.setName(fName);
                site.setState(state);
                if (addresses.size() > 0) {
                    Address address = addresses.get(0);
                    site.setCoordinates(address.getLatitude() + "," + address.getLongitude());
                }
                log.warn(site.toString());
                siteService.save(site);
            }
        }
        resultSet.close();
        stm.close();
        /*
        select f.*, fi.name, fc.email, fc.phone
        from facilities f,
             facility_contacts fc,
             facility_investigators fi
        where f.id = fc.facility_id
          and f.id = fi.facility_id
          and fc.contact_type = 'primary'
          and f.nct_id = 'NCT02465060';
        */
    }

    // validate sites by sending the coordinates to openstreetmap
    private void validateSites() {
        this.siteService.findAll()
            .stream()
            .filter(site -> StringUtil.isNotEmpty(site.getCoordinates()))
            .forEach(
                site -> {
                    String[] coordinates = site.getCoordinates().split(",");
                    String latStr = Optional.ofNullable(coordinates[0]).orElse(null);
                    String lonStr = Optional.ofNullable(coordinates[1]).orElse(null);
                    if (NumberUtils.isCreatable(latStr) && NumberUtils.isCreatable(lonStr)) {
                        try {
                            NominatimReverseRequest nominatimReverseRequest = new NominatimReverseRequest();
                            nominatimReverseRequest.setAcceptLanguage(Locale.ENGLISH.getLanguage());
                            nominatimReverseRequest.setQuery(Double.parseDouble(lonStr), Double.parseDouble(latStr));
                            Address address = this.jsonNominatimClient.getAddress(nominatimReverseRequest);
                            Optional<Element> cityOptional = Arrays
                                .stream(address.getAddressElements())
                                .filter(element -> element.getKey().equalsIgnoreCase("city"))
                                .findFirst();
                            if (cityOptional.isEmpty()) {
                                cityOptional =
                                    Arrays
                                        .stream(address.getAddressElements())
                                        .filter(element -> element.getKey().equalsIgnoreCase("town"))
                                        .findFirst();
                            }
                            Optional<Element> stateOptional = Arrays
                                .stream(address.getAddressElements())
                                .filter(element -> element.getKey().equalsIgnoreCase("state"))
                                .findFirst();
                            Optional<Element> countryOptional = Arrays
                                .stream(address.getAddressElements())
                                .filter(element -> element.getKey().equalsIgnoreCase("country"))
                                .findFirst();

                            if (countryOptional.isEmpty() || StringUtil.isEmpty(site.getCountry())) {
                                log.error(
                                    "One of the resources does not have country. Site ID: " +
                                    site.getId() +
                                    " Normal: " +
                                    site.getCountry() +
                                    " Reverse: " +
                                    Optional.ofNullable(countryOptional.get().getValue()).orElse("")
                                );
                            } else if (!countryOptional.get().getValue().equalsIgnoreCase(site.getCountry())) {
                                log.error(
                                    "Country does not match. Site ID: " +
                                    site.getId() +
                                    " Normal: " +
                                    site.getCountry() +
                                    " Reverse: " +
                                    countryOptional.get().getValue()
                                );
                            } else {
                                if (
                                    stateOptional.isPresent() &&
                                    StringUtil.isNotEmpty(site.getState()) &&
                                    !stateOptional.get().getValue().equalsIgnoreCase(site.getState())
                                ) {
                                    log.warn(
                                        "State does not match. Site ID: " +
                                        site.getId() +
                                        "  Normal: " +
                                        site.getState() +
                                        " Reverse:" +
                                        stateOptional.get().getValue()
                                    );
                                }
                                if (
                                    cityOptional.isPresent() &&
                                    StringUtil.isNotEmpty(site.getCity()) &&
                                    !cityOptional.get().getValue().equalsIgnoreCase(site.getCity())
                                ) {
                                    log.warn(
                                        "City does not match. Site ID: " +
                                        site.getId() +
                                        "  Normal: " +
                                        site.getCity() +
                                        " Reverse:" +
                                        cityOptional.get().getValue()
                                    );
                                }
                            }
                        } catch (IOException e) {
                            log.error("Error fetching coordinates. Site ID: " + site.getId() + " ", site.toString(), e);
                        }
                    } else {
                        log.error("Invalid coordinates", site.toString());
                    }
                }
            );
    }

    private void buildQuery(List<String> queryParams, String value) {
        if (StringUtil.isNotEmpty(value)) {
            queryParams.add(value.replaceAll("[,\\s]", "+").replaceAll("[\\+]+", "+"));
        }
    }

    private List<String> wrapSqlStringInClause(List<String> strings) {
        return strings
            .stream()
            .map(
                term -> {
                    if (term.contains("'")) {
                        term = term.replace("'", "''");
                    }
                    return "'" + term + "'";
                }
            )
            .collect(Collectors.toList());
    }
}
