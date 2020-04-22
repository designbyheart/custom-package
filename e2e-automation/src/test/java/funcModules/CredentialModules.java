package test.java.funcModules;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppPageInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.AppiumUtils;
import test.java.appModules.RestApi;
import test.java.pageObjects.CredentialPage;

/**
 * The CredentialModules class is to implement method related to Credentials
 * 
 */
public class CredentialModules extends AppPageInjector {

	RestApi restApiObj = new RestApi();

	/**
	 * accept the Credentials from connect me app
	 * 
	 * @param driver - appium driver available for session
	 * @return void
	 */

	public void acceptCredential(AppiumDriver driver, boolean useMyConnections) throws Exception {
//		AppiumUtils.findElement(driver, "//*[@text=\"Evernym QA-RC\"]", "Connection Entry", 2).click();
//		AppiumUtils.findElement(driver, "//*[@text=\"View\"]", "View").click();
		if (useMyConnections) {
			homePageV2.burgerMenuButton(driver).click();
			menuPageV2.myConnectionsButton(driver).click();
			myConnectionsPageV2.testConnection(driver).click();
			myConnectionsPageV2.viewButton(driver).click();
		}
		else {
			homePageV2.newMessage(driver).isEnabled();
			homePageV2.newMessage(driver).click();
		}
		credentialPage.accept_Button(driver).isEnabled();
		credentialPage.accept_Button(driver).click();
		Thread.sleep(45000);  //  sync issue
//		credentialPage.continue_Button(driver).click();

	}

	/**
	 * to check insufficient balance case for paid credential
	 * 
	 * @param driver - appium driver available for session
	 * @return void
	 */

	public void checkNSF(AppiumDriver driver) throws Exception {
		Thread.sleep(10000);
		credentialPage.accept_Button(driver).click();
		credentialPage.nsf_Button(driver).click();

	}

}
