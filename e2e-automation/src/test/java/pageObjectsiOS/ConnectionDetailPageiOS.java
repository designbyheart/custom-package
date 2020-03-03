package test.java.pageObjectsiOS;

import org.openqa.selenium.WebElement;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.ConnectionDetailPage;

/**
 * The ConnectionDetailPageiOS class is to hold webelement for ConnectionDetail Page for iOS
 * 
 */
public class ConnectionDetailPageiOS implements ConnectionDetailPage {

	public WebElement cross_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='connection-header-close']",
				"Cross Button");

	}

	public WebElement continue_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[@name='invitation-success-continue']",
				"Continue Button");
	}

}
