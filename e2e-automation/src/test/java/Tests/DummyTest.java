package test.java.Tests;

import com.google.inject.Guice;
import com.google.inject.Injector;
import io.appium.java_client.AppiumDriver;
import org.testng.annotations.*;
import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.RestApi;
import test.java.funcModules.LockModules;
import test.java.utility.Config;
import test.java.utility.IntSetup;

public class DummyTest extends IntSetup {

    Injector injector = Guice.createInjector(new AppInjector());
    AppUtils objAppUtlis = injector.getInstance(AppUtils.class);
    LockModules objLockModules = injector.getInstance(LockModules.class);

    @BeforeClass
    public void BeforeClassSetup() throws Exception {
        connectionID = RestApi.readConfig("connectionID");
        System.out.println(">>> Class setup has been finished!");
    }

    @BeforeMethod
    public void BeforeMethodSetup() throws Exception {
        driver = IntSetup.configureDriver(Config.Device_Type, "connectMe");
        Thread.sleep(3000);
        objAppUtlis.enterPincode(driver);
        System.out.println(">>> >>> Method setup has been finished!");
    }

    public Object[][] testData() {
        return new Object[][] {
                {},
                {}
        };
    }

    @Test(invocationCount = 2)
    public void oneCredentialHappyPath() throws Exception {
        // schema
        String schemaData = "{\"constraints\":[],\"name\":\"FirstName\",\"type\":0}," +
                            "{\"constraints\":[],\"name\":\"LastName\",\"type\":0}," +
                            "{\"constraints\":[],\"name\":\"Years\",\"type\":0}";
        String schemaID = objAppUtlis.createSchema(schemaData);

        // credential definition
        String credentialDefID = objAppUtlis.createCredentialDef(schemaID, "0");

        // credential
        String credentialData = "{\"name\":\"FirstName\",\"type\":0,\"value\":\"Pyotr\"}," +
                                "{\"name\":\"LastName\",\"type\":0,\"value\":\"Pustota\"}," +
                                "{\"name\":\"Years\",\"type\":0,\"value\":\"99\"}";
        objAppUtlis.sendCredentialAndAccept(driver, connectionID, credentialDefID, credentialData,"0");

        // proof
        String proofData = "{\"name\":\"FirstName\"}," +
                           "{\"name\":\"LastName\"}," +
                           "{\"name\":\"Years\"}";
        String proofID = objAppUtlis.createProof(proofData);
        objAppUtlis.sendAndAcceptProof(driver, connectionID, proofID);
    }

    @Test(invocationCount = 2)
    public void anotherCredentialHappyPath() throws Exception {
        // schema
        String schemaData = "{\"constraints\":[],\"name\":\"Company\",\"type\":0}," +
                            "{\"constraints\":[],\"name\":\"Position\",\"type\":0}";
        String schemaID = objAppUtlis.createSchema(schemaData);

        // credential definition
        String credentialDefID = objAppUtlis.createCredentialDef(schemaID, "0");

        // credential
        String credentialData = "{\"name\":\"Company\",\"type\":0,\"value\":\"Evernym\"}," +
                                "{\"name\":\"Position\",\"type\":0,\"value\":\"Developer\"}";
        objAppUtlis.sendCredentialAndAccept(driver, connectionID, credentialDefID, credentialData,"0");

        // proof
        String proofData = "{\"name\":\"Company\"}," +
                           "{\"name\":\"Position\"}";
        String proofID = objAppUtlis.createProof(proofData);
        objAppUtlis.sendAndAcceptProof(driver, connectionID, proofID);
    }

    @Test(dependsOnMethods = {"oneCredentialHappyPath", "anotherCredentialHappyPath"}, invocationCount = 3)
    public void multiProof() throws Exception {
        // multi proof
        String proofData = "{\"name\":\"FirstName\"}," +
                           "{\"name\":\"LastName\"}," +
                           "{\"name\":\"Years\"}," +
                           "{\"name\":\"Company\"}," +
                           "{\"name\":\"Position\"}";
        String proofID = objAppUtlis.createProof(proofData);
        objAppUtlis.sendAndAcceptProof(driver, connectionID, proofID);
    }

    @AfterMethod
    public void AfterMethodTeardown() throws Exception {
        driver.quit();
        System.out.println(">>> >>> Method teardown has been finished!");
    }

    @AfterClass
    public void AfterClassTeardown() throws Exception {
        System.out.println(">>> Class teardown has been finished!");
    }

}