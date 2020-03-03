
package test.java.Tests;

import io.appium.java_client.AppiumDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.AppiumUtils;
import test.java.appModules.ReadMail;
import test.java.appModules.RestApi;
import test.java.funcModules.ConnectionModules;
import test.java.funcModules.LockModules;
import test.java.funcModules.SwitchEnvModules;
import test.java.utility.Config;
import test.java.utility.IntSetup;

import java.util.HashMap;
import org.testng.annotations.Test;
import org.testng.annotations.AfterClass;
import com.google.inject.Guice;
import com.google.inject.Injector;

/**
 * The ConnectionTest class is a Test class which holds test method related to
 * connection
 */
public class ConnectionTest extends IntSetup {

	public AppiumDriver driverBrowser;
	public String installConnectMeLink;
	RestApi objRestApi = new RestApi();
	Injector injector = Guice.createInjector(new AppInjector());
	ConnectionModules objConnectionModules = injector.getInstance(ConnectionModules.class);
	LockModules objLockModules = injector.getInstance(LockModules.class);
	SwitchEnvModules objSwitchEnvModules = injector.getInstance(SwitchEnvModules.class);
	AppUtils objAppUtlis = injector.getInstance(AppUtils.class);

	/**
	 * Test to install ConnectMe App
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" })
	public void getInvitationLinkTest() throws Exception {
		System.out.println("Get invitation link for installing ConnectMe app");
		HashMap<String, String> sendConnectionInviteResponse = objRestApi.sendConnectionInvite();
		connectionID = objRestApi.getKeyValue(sendConnectionInviteResponse, "id");
		RestApi.writeConfig("connectionID", connectionID);
		Thread.sleep(10000);
		installConnectMeLink = ReadMail.getSmsLink();
		if (Config.Device_Type.equals("iOS")) {
			driverBrowser = IntSetup.configureDriver(Config.Device_Type, "safari");
			objConnectionModules.installApp(driverBrowser, installConnectMeLink);
		} else if (Config.Device_Type.equals("android")) {
			driverBrowser = IntSetup.configureDriver(Config.Device_Type, "chrome");
			objConnectionModules.installApp(driverBrowser, installConnectMeLink);
		} else if (Config.Device_Type.equals("awsAndroid")) {
			driverBrowser = IntSetup.configureDriver(Config.Device_Type, "chrome");
			driverBrowser.get(installConnectMeLink);
			Thread.sleep(2000);
		} else if (Config.Device_Type.equals("awsiOS")) {
			driverBrowser = IntSetup.configureDriver(Config.Device_Type, "safari");
			driverBrowser.get(installConnectMeLink);
			Thread.sleep(2000);
		}
		driverBrowser.quit();
	}

	/**
	 * Test to switch environment in ConnectMe App
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "getInvitationLinkTest")
	public void switchEnvTest() throws Exception {
		Thread.sleep(5000);  // sleep to get app installed
		driver = IntSetup.configureDriver(Config.Device_Type, "connectMe");
		System.out.println("Switch The Environment Tc");
		objLockModules.navigateswitchEnv(driver);
		objSwitchEnvModules.switchEnv(driver, Config.Env_Type);
	}

	/**
	 * Test for setting up the pincode in ConnectMe App
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "switchEnvTest")
	public void pincodeSetupTest() throws Exception {
		objLockModules.pinCodeSetup(driver);
	}

	/**
	 * Test for accepting connection in ConnectMe App
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "pincodeSetupTest")
	public void acceptConnectionTest() throws Exception {
		try {
			objConnectionModules.appProvisioningRequest("Accept", driver, "allow");
		}
		// CM-2517 workaround
		catch (Exception ex) {
			System.out.println(ex.toString());

			if (Config.Device_Type.equals("android") || Config.Device_Type.equals("awsAndroid")) {
				driverBrowser = IntSetup.configureDriver(Config.Device_Type, "chrome");
			} else {
				driverBrowser = IntSetup.configureDriver(Config.Device_Type, "safari");
			}
			driverBrowser.get(installConnectMeLink);

			Thread.sleep(3000);

			driver.context("NATIVE_APP");
			objAppUtlis.enterPincode(driver);
			objConnectionModules.appProvisioningRequest("Accept", driver, "allow");
		}
		finally {
			HashMap<String, String> statusConnection = objRestApi.get("/api/v1/connections", connectionID);
			String statusConnectionStr = objRestApi.getKeyValue(statusConnection, "state");
			System.out.println(statusConnectionStr);
			objRestApi.poll(statusConnectionStr, "4", connectionID, "connections");
		}
	}

	/**
	 * Test to validate connection bubble
	 * @return void
	 */
	@Test(groups = { "Smoke", "Regression" }, dependsOnMethods = "acceptConnectionTest", enabled = false)
	public void validateConnectionBubble() throws Exception {
		objConnectionModules.validateConnectionBubble(driver);
	}

	@AfterClass
	public void AfterClass() {
//		driver.removeApp("me.connect");
		driverBrowser.quit();
		driver.quit();
	}

}