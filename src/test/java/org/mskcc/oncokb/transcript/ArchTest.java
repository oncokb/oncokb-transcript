package org.mskcc.oncokb.transcript;

import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

import com.tngtech.archunit.core.domain.JavaClasses;
import com.tngtech.archunit.core.importer.ClassFileImporter;
import com.tngtech.archunit.core.importer.ImportOption;
import org.junit.jupiter.api.Test;

class ArchTest {

    @Test
    void servicesAndRepositoriesShouldNotDependOnWebLayer() {
        JavaClasses importedClasses = new ClassFileImporter()
            .withImportOption(ImportOption.Predefined.DO_NOT_INCLUDE_TESTS)
            .importPackages("org.mskcc.cbio");

        noClasses()
            .that()
            .resideInAnyPackage("org.mskcc.cbio.service..")
            .or()
            .resideInAnyPackage("org.mskcc.cbio.repository..")
            .should()
            .dependOnClassesThat()
            .resideInAnyPackage("..org.mskcc.cbio.web..")
            .because("Services and repositories should not depend on web layer")
            .check(importedClasses);
    }
}
