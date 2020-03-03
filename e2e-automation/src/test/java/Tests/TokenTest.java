
package test.java.Tests;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.AppiumUtils;
import test.java.appModules.ReadMail;
import test.java.appModules.RestApi;
import test.java.funcModules.ConnectionModules;
import test.java.funcModules.LockModules;
import test.java.funcModules.SwitchEnvModules;
import test.java.funcModules.TokenModules;
import test.java.pageObjects.ChooseLockPage;
import test.java.pageObjects.ConnectionDetailPage;
import test.java.pageObjects.HomePage;
import test.java.pageObjects.PincodePage;
import test.java.utility.Config;
import test.java.utility.IntSetup;

import java.util.HashMap;
import org.testng.annotations.*;

import com.google.inject.Guice;
import com.google.inject.Injector;

/**
 * The TokenTest class is a Test class which holds test
 * method related to Tokens
 */
public class TokenTest extends IntSetup {

	public AppiumDriver driver;
	RestApi objRestApi = new RestApi();
	Injector injector = Guice.createInjector(new AppInjector());		
	TokenModules objTokenModules = injector.getInstance(TokenModules.class);
	AppUtils objAppUtlis = injector.getInstance(AppUtils.class);
	
	/**
	 * Test to navigate to token screen  and copy address to clipboard
	 * @return  void
	 */
	@Test(groups = { "Smoke", "Regression" }, priority = 6, enabled = false)
	public void copyToclipboardTokenTest() throws Exception {
		driver = IntSetup.configureDriver(Config.Device_Type,"connectMe");
		objAppUtlis.enterPincode(driver);
		objTokenModules.navigateTokenScreen(driver);
		objTokenModules.copyToClipboard(driver);
	}
	
	/**
	 * Test to send tokens for valid address and check in history
	 * @return  void
	 */
	@Test(groups = { "Smoke", "Regression" }, priority = 7, enabled = false)
	public void sendTokenValidAddress() throws Exception {
		objTokenModules.sendTokenValidAddress(driver);
	}
	
	/**
	 * Test to validate sender address on token send screen
	 * @return  void
	 */
	@Test(groups = { "Smoke", "Regression" }, priority = 8, enabled = false)
	public void validateSenderaddress() throws Exception {
		objTokenModules.validateSenderAddress(driver);
	}
	

	@AfterClass
	public void AfterClass() {
		driver.quit();
	}
}