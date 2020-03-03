package test.java.funcModules;

import java.awt.event.KeyEvent;
import java.util.Set;

import io.restassured.RestAssured;
import io.restassured.response.Response;
import org.openqa.selenium.By;
import org.openqa.selenium.support.ui.ExpectedConditions;

import com.google.inject.Guice;
import com.google.inject.Inject;
import com.google.inject.Injector;

import io.appium.java_client.AppiumDriver;
import io.appium.java_client.TouchAction;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.android.AndroidKeyCode;
import test.java.appModules.AppInjector;
import test.java.appModules.AppPageInjector;
import test.java.appModules.AppUtils;
import test.java.appModules.AppiumUtils;
import test.java.appModules.RestApi;
import test.java.pageObjects.ConnectionDetailPage;
import test.java.pageObjects.ConnectionHistoryPage;
import test.java.pageObjects.HockeyAppPage;
import test.java.pageObjects.HomePage;
import test.java.pageObjects.PincodePage;
import test.java.utility.Config;
import test.java.utility.IntSetup;

/**
 * The ConnectionModules class is to implement method related to connection
 * 
 */
public class ConnectionModules extends AppPageInjector {
	Injector injector = Guice.createInjector(new AppInjector());
	AppUtils objAppUtlis = injector.getInstance(AppUtils.class);
	RestApi RestApiObj = new RestApi();

	/**
	 * install the app from hockeyapp by sms link
	 * 
	 * @param driver - appium driver available for session
	 * @param link  - sms link for which we will install app
	 * @return void
	 */
	public void installApp(AppiumDriver driver, String link) throws Exception {

		if (Config.Device_Type.equals("iOS")) {
			driver.get(link);
			Thread.sleep(5000);
//			-----
//			hockeyAppPage.userNameText(driver).click();
//			driver.getKeyboard().sendKeys("ankur.mishra@evernym.com");
//			hockeyAppPage.passwordText(driver).click();
//			driver.getKeyboard().sendKeys("evernymzmr123$");
//			hockeyAppPage.signinButton(driver).click();
//			String InstallConnectMeLink = hockeyAppPage.installButton(driver).getAttribute("href");
//			Config.BuildNo = hockeyAppPage.appVersion(driver).getText().substring(13, 16);
//			System.out.println("build no" + Config.BuildNo);
//			driver.get(InstallConnectMeLink);
//			driver.switchTo().alert().accept();
		} else if (Config.Device_Type.equals("android")) {
			driver.get(link);
			Thread.sleep(3000);
            ((AndroidDriver) driver).pressKeyCode(AndroidKeyCode.BACK);
            RestAssured.baseURI = "https://api.appcenter.ms/v0.1/apps";
            final String owner = "/build-zg6l";
            final String app = "/QA-MeConnect-Android";
            final String postfix = "/releases/latest";
            final String token = "bd9a9b4be1ce8bd87e99b7b0a150663d00e56566";
            String InstallConnectMeLink = RestAssured
													.given()
													.header("X-API-Token", token)
													.when().get(owner + app + postfix)
													.then().statusCode(200)
													.extract().path("install_url");
            System.out.println(InstallConnectMeLink);
            driver.installApp(InstallConnectMeLink);
//			-----
//			hockeyAppPage.userNameText(driver).click();
//			driver.getKeyboard().sendKeys("ankur.mishra@evernym.com");
//			hockeyAppPage.passwordText(driver).click();
//			driver.getKeyboard().sendKeys("evernymzmr123$");
//			hockeyAppPage.signinButton(driver).click();
//			hockeyAppPage.qaConnectIcon(driver).click();
//			String InstallConnectMeLink = hockeyAppPage.installButton(driver).getAttribute("href");
//			Config.BuildNo = hockeyAppPage.appVersion(driver).getText().substring(13, 16);
//			System.out.println("build no" + Config.BuildNo);
//			driver.installApp(InstallConnectMeLink);
		}

	}

	/**
	 * accepts or deny the connection request
	 * 
	 * @param driver           - appium driver available for session
	 * @param requestType     - accept or reject connection according to user
	 * @param pushNotification - allow or deny push notification
	 * @return void
	 */
	public void appProvisioningRequest(String requestType, AppiumDriver driver, String pushNotification)
			throws Exception {
		if (requestType == "Accept") {
			objAppUtlis.requestProvisioning(driver, "Accept", pushNotification);
		} else {
			objAppUtlis.requestProvisioning(driver, "Deny", pushNotification);
		}
		if (Config.Device_Type.equals("iOS")) {
			pincodePage.pinCodeVerify_TextBox(driver).sendKeys("123456");
		} else {
			Thread.sleep(3000);
			objAppUtlis.enterPincode(driver);
		}
//		connectionDetailPage.continue_Button(driver).click();
	}

	/**
	 * delete a connection in ConnectMe app
	 * 
	 * @param driver - appium driver available for session
	 * @return void
	 */
	public void deleteConnection(AppiumDriver driver) throws Exception {
		String connectionBubbleXpath = "//XCUIElementTypeOther[contains(@name, 'bubble')";
		homePage.connection_Bubble(driver).click();
		connectionHistoryPage.delete_Icon(driver).click();
		connectionHistoryPage.delete_Button(driver).click();
		AppiumUtils.elementNotPresent(driver, "connectionBubbleXpath", "Connection bubble");
	}

	/**
	 * to validate a connection bubble at home screen
	 * 
	 * @param driver - appium driver available for session
	 * @return void
	 */
	public void validateConnectionBubble(AppiumDriver driver) throws Exception {
		AppiumUtils.longPress(driver, homePage.connection_Bubble(driver));
		String alertText = driver.switchTo().alert().getText();
		alertText.contains("Sender DID");
		alertText.contains("My DID");
		driver.switchTo().alert().accept();
	}
}
