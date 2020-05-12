package test.java.Tests;

import com.google.inject.Guice;
import com.google.inject.Injector;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.AppiumUtils;
import test.java.appModules.RestApi;
import test.java.utility.Config;
import test.java.utility.IntSetup;

public class CredentialTestV2 extends IntSetup {

    Injector injector = Guice.createInjector(new AppInjector());
    AppUtils objAppUtlis = injector.getInstance(AppUtils.class);

    @BeforeClass
    public void BeforeClassSetup() throws Exception {
        connectionID = RestApi.readConfig("connectionID");
        driver = IntSetup.configureDriver(Config.Device_Type, "connectMe");
        Thread.sleep(3000);
        objAppUtlis.enterPincode(driver);

        // schema
        String schemaData =
                        "{\"constraints\":[],\"name\":\"FirstName\",\"type\":0}," +
                        "{\"constraints\":[],\"name\":\"LastName\",\"type\":0}," +
                        "{\"constraints\":[],\"name\":\"Years\",\"type\":0}," +
                        "{\"constraints\":[],\"name\":\"Status\",\"type\":0}";
        String schemaID = objAppUtlis.createSchema(schemaData);

        // credential definition
        credentialDefID = objAppUtlis.createCredentialDef(schemaID, "0");
    }

    // TODO probably it can be made as one parametrized test

    @Test
    public void acceptCredentialFromHome() throws Exception {
        // one credential
        String credentialData =
                        "{\"name\":\"FirstName\",\"type\":0,\"value\":\"Pyotr\"}," +
                        "{\"name\":\"LastName\",\"type\":0,\"value\":\"Pustota\"}," +
                        "{\"name\":\"Years\",\"type\":0,\"value\":\"33\"}," +
                        "{\"name\":\"Status\",\"type\":0,\"value\":\"Poet\"}";
        objAppUtlis.sendCredentialAndAccept(driver, connectionID, credentialDefID, credentialData, "0", false, false);
    }

    @Test(dependsOnMethods = "acceptCredentialFromHome")
    public void acceptCredentialFromMyConnections() throws Exception {
        // another credential
        String credentialData =
                        "{\"name\":\"FirstName\",\"type\":0,\"value\":\"Vasily\"}," +
                        "{\"name\":\"LastName\",\"type\":0,\"value\":\"Chapayev\"}," +
                        "{\"name\":\"Years\",\"type\":0,\"value\":\"55\"}," +
                        "{\"name\":\"Status\",\"type\":0,\"value\":\"Battle Commander\"}";
        objAppUtlis.sendCredentialAndAccept(driver, connectionID, credentialDefID, credentialData, "0", true, false);
        AppiumUtils.tapBack(driver, 2);
    }

    @Test(dependsOnMethods = "acceptCredentialFromMyConnections")
    public void ignoreCredentialFromHome() throws Exception {
        // one credential
        String credentialData =
                        "{\"name\":\"FirstName\",\"type\":0,\"value\":\"Vavilen\"}," +
                        "{\"name\":\"LastName\",\"type\":0,\"value\":\"Tatarskiy\"}," +
                        "{\"name\":\"Years\",\"type\":0,\"value\":\"33\"}," +
                        "{\"name\":\"Status\",\"type\":0,\"value\":\"Creator\"}";
        objAppUtlis.sendCredentialAndAccept(driver, connectionID, credentialDefID, credentialData, "0", false, true);
    }

    @Test(dependsOnMethods = "ignoreCredentialFromHome")
    public void ignoreCredentialFromMyConnections() throws Exception {
        // another credential
        String credentialData =
                        "{\"name\":\"FirstName\",\"type\":0,\"value\":\"Leonid\"}," +
                        "{\"name\":\"LastName\",\"type\":0,\"value\":\"Azadovskiy\"}," +
                        "{\"name\":\"Years\",\"type\":0,\"value\":\"55\"}," +
                        "{\"name\":\"Status\",\"type\":0,\"value\":\"Cynically ruthless advertising genius\"}";
        objAppUtlis.sendCredentialAndAccept(driver, connectionID, credentialDefID, credentialData, "0", true, true);
    }

    @AfterClass
    public void AfterClass() {
        driver.quit();
    }

}
