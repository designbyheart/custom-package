
package test.java.Tests;

import java.util.HashMap;

import org.openqa.selenium.JavascriptExecutor;
import org.openqa.selenium.remote.RemoteWebElement;
import org.testng.annotations.*;

import com.google.inject.Guice;
import com.google.inject.Injector;

import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.AppiumUtils;
import test.java.appModules.RestApi;
import test.java.funcModules.ConnectionModules;
import test.java.funcModules.LockModules;
import test.java.pageObjects.ConnectionDetailPage;
import test.java.pageObjects.HomePage;
import test.java.pageObjects.PincodePage;
import test.java.utility.Config;
import test.java.utility.IntSetup;

/**
 * The NegativeTest class is a Test class which holds negative test methods related to ConnectMe app
 */
public class NegativeTest extends IntSetup {

	RestApi objRestApi = new RestApi();
	Injector injector = Guice.createInjector(new AppInjector());		
	ConnectionModules objConnectionModules = injector.getInstance(ConnectionModules.class);
	LockModules objLockModules = injector.getInstance(LockModules.class);
    ConnectionTest objConnectionTest =new ConnectionTest();
    AppUtils objAppUtlis = injector.getInstance(AppUtils.class);

	@BeforeClass
	public void BeforeClass() throws Exception{
		connectionID = RestApi.readConfig("connectionID");
		driver = IntSetup.configureDriver(Config.Device_Type,"connectMe");
		Thread.sleep(3000);
		objAppUtlis.enterPincode(driver);
	}

    /**
	 * Test for  Changing the pincode in ConnectMe App
	 * @return  void
	 */
	@Test(groups = {"Smoke", "Regression"})
	public void changePinCodeTest() throws Exception {
		objLockModules.changePinCode(driver);
	}
	
	/**
	 * Test for toggling the Enable Touch id in ConnectMe App
	 * @return  void
	 */
	@Test(groups = {"Smoke", "Regression"})
	public void togglingTouchIDTest() throws Exception {
		objLockModules.toggleTouchID(driver);
	}
    
	/**
	 * Test for  Changing the avatar in ConnectMe App
	 * @return  void
	 */
	@Test(groups = {"Regression" }, enabled = false)
	public void changeAvatar() throws Exception {
		 objLockModules.changeUserAvatar(driver);
	}
	
    /**
	 * Test to overlay of claim and proof
	 * @return void
	 */ 
    @Test(groups = {"Regression" }, enabled=false)
	public void screenOverlayClaimAndProofTest() throws Exception {
        String dataCredential = "{\"name\":\"Name\",\"value\":\"Alex\"},{\"name\":\"Degree\",\"value\":\"MBA\"},{\"name\":\"Social Security Number\",\"value\":\"38632362362\"}";
		String credentialID = objAppUtlis.sendCredential(driver, connectionID, credentialDefID2, dataCredential,"0");
		String data = "{\"name\":\"Name\",\"value\":\"\"},{\"name\":\"PhoneNo\",\"value\":\"\"}";
		objAppUtlis.sendAndAcceptProof(driver, connectionID, proofID);
		objAppUtlis.acceptCredential(driver, credentialID ,false);
	}
    
    /**
	 * Test to overlay of multiple proofs
	 * @return void
	 */ 
    //once bug C0-CO-1292 will enable the TC
    @Test(groups = {"Regression" }, enabled=false)
	public void screenOverlayMultipleProofTest() throws Exception {
		String dataProof1 = "{\"name\":\"Name\",\"value\":\"\"},{\"name\":\"PhoneNo\",\"value\":\"\"}";
		String sendProofID1=objAppUtlis.sendProof(driver, connectionID, proofID);
		String dataProof2 = "{\"name\":\"Name\",\"value\":\"\"},{\"name\":\"SSN\",\"value\":\"\"},{\"name\":\"Degree\",\"value\":\"\"},{\"name\":\"PhoneNo\",\"value\":\"\"}";
		objAppUtlis.sendAndAcceptProof(driver, connectionID, multipleProofID);
		objAppUtlis.AcceptProof(driver, sendProofID1);
	}	


	/**
	 * Test to install ConnectMe App with disabled push notification
	 * @return  void
	 */
	@Test(groups = {"Regression" }, enabled=false)
	public void connectionDenyPN() throws Exception {
		driver.removeApp("com.evernym.connectme.callcenter");
		driver.quit();
		objConnectionTest.getInvitationLinkTest();
		objConnectionTest.switchEnvTest();
		objConnectionTest.pincodeSetupTest();
		HashMap<String, String> statusConnection;
		objConnectionModules.appProvisioningRequest("Accept", driver,"deny");
		statusConnection = objRestApi.pollConnection(connectionID);
		objRestApi.responseMatcher(statusConnection, "state", "4");//validate the state of connection	
	}
		
	/**
	 * Test to delete the connection
	 * @return void
	 */
	@Test(groups = {"Regression"}, enabled=false)
	public void deleteConnectionTest() throws Exception {
	    objConnectionModules.deleteConnection(driver);

	}

	@AfterClass
	public void AfterClass() {
		driver.quit();
	}
	
}