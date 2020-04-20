package test.java.utility;

import com.google.common.collect.ImmutableMap;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.appium.java_client.AppiumDriver;
import io.appium.java_client.android.AndroidDriver;
import io.appium.java_client.ios.IOSDriver;
import test.java.appModules.RestApi;
import test.java.utility.Config;

import org.openqa.selenium.UnexpectedAlertBehaviour;
import org.openqa.selenium.remote.CapabilityType;
import org.openqa.selenium.remote.DesiredCapabilities;
import org.testng.Assert;
import org.testng.Reporter;
import org.testng.annotations.AfterSuite;
import org.testng.annotations.BeforeSuite;

import java.io.*;
import java.net.URL;
import java.util.Properties;
import java.util.concurrent.TimeUnit;

/**
 * The IntSetup class is to implement method for intializating webdriver
 * 
 */
public class IntSetup {

	public static AppiumDriver driver;
	public static String connectionID;
	public Context ctx = Context.getInstance();
	public static String schemaSeqId1, schemaSeqId2, credentialDefID1, credentialDefID2;
	public static String proofID, multipleProofID, selfAttestedProofID, multipleClaimProofID;
	public static String tokenAddress;

	RestApi objRestApi = new RestApi();

	@BeforeSuite(groups = { "Regression", "Smoke" })
	public void beforeSuite() throws Exception {

	}

	/**
	 * To intialize webdriver and launch it
	 * 
	 * @param deviceType-to intialize and launch safari or connect me
	 * @return appium webdriver for connect me app or safari
	 */
	public static AppiumDriver configureDriver(String deviceType, String appType) throws Exception {

		try {
			DesiredCapabilities capabilities = new DesiredCapabilities();
			if (deviceType.equals("iOS") && appType.equals("connectMe")) {
				capabilities.setCapability("automationName", "XCUITest");
				capabilities.setCapability("platformVersion", "11.2");
				capabilities.setCapability("platformName", "iOS");
				capabilities.setCapability("bundleId", "com.evernym.connectme.callcenter");
				capabilities.setCapability("deviceName", Config.Device_Name); // name
				capabilities.setCapability("udid", Config.Device_Udid);
				capabilities.setCapability("xcodeOrgId", "ES8QU3D2A4");
				capabilities.setCapability("xcodeSigningId", "iPhone Developer");
				capabilities.setCapability("clearSystemFiles", "true");
				capabilities.setCapability("waitForQuiescence", "false");
				capabilities.setCapability("useNewWDA", "true");
				capabilities.setCapability("shouldUseSingletonTestManager", "true");
				capabilities.setCapability("wdaStartupRetryInterval", "1000");
				capabilities.setCapability("newCommandTimeout", "600");
				driver = new IOSDriver(new URL(Config.Appium_Server), capabilities);
				driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
				System.out.println("connectMe application launched successfully in iOS");

			} else if (deviceType.equals("iOS") && appType.equals("safari")) {
				capabilities.setCapability("platformVersion", "11.2");
				capabilities.setCapability("platformName", "iOS");
				capabilities.setCapability("deviceName", Config.Device_Name);// devie
				capabilities.setCapability("udid", Config.Device_Udid);// udid
				capabilities.setCapability("browserName", "Safari");
				capabilities.setCapability("safariAllowPopups", "true");
				capabilities.setCapability("clearSystemFiles", "true");
				capabilities.setCapability("waitForQuiescence", "false");
				capabilities.setCapability("useNewWDA", "true");
				capabilities.setCapability("shouldUseSingletonTestManager", "true");
				capabilities.setCapability("wdaStartupRetryInterval", "1000");
				driver = new IOSDriver(new URL(Config.Appium_Server), capabilities);
				driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
				System.out.println("safari browser launched successfully in iOS");

			} else if (deviceType.equals("awsiOS") && appType.equals("safari")) {
				capabilities.setCapability("platformName", "iOS");
				capabilities.setCapability("browserName", "Safari");
				capabilities.setCapability("safariAllowPopups", "true");
				capabilities.setCapability("clearSystemFiles", "true");
				capabilities.setCapability("waitForQuiescence", "false");
				capabilities.setCapability("useNewWDA", "true");
				capabilities.setCapability("shouldUseSingletonTestManager", "true");
				capabilities.setCapability("wdaStartupRetryInterval", "1000");
				driver = new IOSDriver(new URL(Config.Appium_Server), capabilities);
				driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
				System.out.println("safari browser launched successfully in iOS");

			}
			if (deviceType.equals("awsiOS") && appType.equals("connectMe")) {
				capabilities.setCapability("automationName", "XCUITest");
				capabilities.setCapability("platformName", "iOS");
				capabilities.setCapability("bundleId", "com.evernym.connectme.callcenter");
				capabilities.setCapability("xcodeOrgId", "ES8QU3D2A4");
				capabilities.setCapability("xcodeSigningId", "iPhone Developer");
				capabilities.setCapability("clearSystemFiles", "true");
				capabilities.setCapability("waitForQuiescence", "false");
				capabilities.setCapability("useNewWDA", "true");
				capabilities.setCapability("shouldUseSingletonTestManager", "true");
				capabilities.setCapability("wdaStartupRetryInterval", "1000");
				capabilities.setCapability("newCommandTimeout", "600");
				driver = new IOSDriver(new URL(Config.Appium_Server), capabilities);
				driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
				System.out.println("connectMe application launched successfully in iOS");

			} else if (deviceType.equals("android") && appType.equals("connectMe")) {
				capabilities.setCapability("automationName", "UiAutomator2");
				capabilities.setCapability("platformName", "Android");
				capabilities.setCapability("noReset", "true");// newCommandTimeout
				capabilities.setCapability("newCommandTimeout", "1800");
				capabilities.setCapability("appPackage", "me.connect");
				capabilities.setCapability("appActivity", ".MainActivity");// appActivity
				capabilities.setCapability("deviceName", Config.Device_Name);// device
				driver = new AndroidDriver(new URL(Config.Appium_Server), capabilities);
				driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
				System.out.println("connectMe application launched successfully in android");

			} else if (deviceType.equals("android") && appType.equals("chrome")) {
				capabilities.setCapability("browserName", "Chrome");
				capabilities.setCapability("automationName", "UiAutomator2");
				capabilities.setCapability("platformName", "Android");
				capabilities.setCapability("newCommandTimeout", "600");
				capabilities.setCapability("deviceName", Config.Device_Name);// device
				capabilities.setCapability(CapabilityType.UNEXPECTED_ALERT_BEHAVIOUR, UnexpectedAlertBehaviour.ACCEPT);
				capabilities.setCapability("autoAcceptAlerts", true);
				capabilities.setCapability("appium:chromeOptions", ImmutableMap.of("w3c", false));
				driver = new AndroidDriver(new URL(Config.Appium_Server), capabilities);
				driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
				System.out.println("chrome browser launched successfully in Android");
			}

			else if (deviceType.equals("awsAndroid") && appType.equals("chrome")) {
				capabilities.setCapability("browserName", "Chrome");
				capabilities.setCapability("automationName", "UiAutomator2");
				capabilities.setCapability("platformName", "Android");
				capabilities.setCapability("newCommandTimeout", "600");
				capabilities.setCapability("deviceName", Config.Device_Name);// device
				capabilities.setCapability(CapabilityType.UNEXPECTED_ALERT_BEHAVIOUR, UnexpectedAlertBehaviour.ACCEPT);
				capabilities.setCapability("autoAcceptAlerts", true);
				driver = new AndroidDriver(new URL(Config.Appium_Server), capabilities);
				driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
				System.out.println("chrome browser launched successfully in Android");
			}

			else if (deviceType.equals("awsAndroid") && appType.equals("connectMe")) {
				capabilities.setCapability("automationName", "UiAutomator2");
				capabilities.setCapability("automationName", "UiAutomator2");
				capabilities.setCapability("platformName", "Android");
				capabilities.setCapability("noReset", "true");// newCommandTimeout
				capabilities.setCapability("newCommandTimeout", "1800");
				capabilities.setCapability("appPackage", "me.connect");
				capabilities.setCapability("appActivity", ".MainActivity");// appActivity
				capabilities.setCapability("deviceName", Config.Device_Name);// device
				driver = new AndroidDriver(new URL(Config.Appium_Server), capabilities);
				driver.manage().timeouts().implicitlyWait(60, TimeUnit.SECONDS);
				System.out.println("connectMe application launched successfully in android");

			}

		}

		catch (Exception e)

		{
			Reporter.log("Class Setup | Method OpenBrowser | Exception desc : " + e.getMessage());
			System.out.println("Class Setup | Method OpenBrowser | Exception desc : " + e.getMessage());
			Assert.assertTrue(false);
		}

		return driver;

	}

	@AfterSuite(groups = { "Regression", "Smoke" })
	public void afterSuite() throws Exception {

	}

}
