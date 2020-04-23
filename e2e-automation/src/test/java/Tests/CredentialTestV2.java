package test.java.Tests;

import com.google.inject.Guice;
import com.google.inject.Injector;
import org.testng.annotations.AfterClass;
import org.testng.annotations.BeforeClass;
import org.testng.annotations.Test;
import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
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
                        "{\"constraints\":[],\"name\":\"Years\",\"type\":0}";
        String schemaID = objAppUtlis.createSchema(schemaData);

        // credential definition
        credentialDefID = objAppUtlis.createCredentialDef(schemaID, "0");
    }

    @Test
    public void acceptCredentialFromHome() throws Exception {
        // credential
        String credentialData =
                        "{\"name\":\"FirstName\",\"type\":0,\"value\":\"Pyotr\"}," +
                        "{\"name\":\"LastName\",\"type\":0,\"value\":\"Pustota\"}," +
                        "{\"name\":\"Years\",\"type\":0,\"value\":\"33\"}";
        objAppUtlis.sendCredentialAndAccept(driver, connectionID, credentialDefID, credentialData, "0", false);
    }

    @Test(dependsOnMethods = "acceptCredentialFromHome")
    public void acceptCredentialFromMyConnections() throws Exception {
        // credential
        String credentialData =
                        "{\"name\":\"FirstName\",\"type\":0,\"value\":\"Vasily\"}," +
                        "{\"name\":\"LastName\",\"type\":0,\"value\":\"Chapayev\"}," +
                        "{\"name\":\"Years\",\"type\":0,\"value\":\"55\"}";
        objAppUtlis.sendCredentialAndAccept(driver, connectionID, credentialDefID, credentialData, "0", true);
    }

    @AfterClass
    public void AfterClass() {
        driver.quit();
    }

}
