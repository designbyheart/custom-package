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

public class ProofTestV2 extends IntSetup{
    Injector injector = Guice.createInjector(new AppInjector());
    AppUtils objAppUtlis = injector.getInstance(AppUtils.class);

    @BeforeClass
    public void BeforeClassSetup() throws Exception {
        connectionID = RestApi.readConfig("connectionID");
        driver = IntSetup.configureDriver(Config.Device_Type, "connectMe");
        Thread.sleep(3000);
        objAppUtlis.enterPincode(driver);
    }

    @Test
    public void sendProofFromHome() throws Exception {
        // proof
        String proofData =
                        "{\"name\":\"FirstName\"}," +
                        "{\"name\":\"Years\"}";
        String proofID = objAppUtlis.createProof(proofData);
        objAppUtlis.sendAndAcceptProof(driver, connectionID, proofID, false);
    }

    @Test(dependsOnMethods = "sendProofFromHome")
    public void sendProofFromMyConnections() throws Exception {
        // proof
        String proofData =
                        "{\"name\":\"LastName\"}," +
                        "{\"name\":\"Years\"}";
        String proofID = objAppUtlis.createProof(proofData);
        objAppUtlis.sendAndAcceptProof(driver, connectionID, proofID, true);
    }

    @AfterClass
    public void AfterClass() {
        driver.quit();
    }

}
