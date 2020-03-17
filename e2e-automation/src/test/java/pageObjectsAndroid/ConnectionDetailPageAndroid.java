package test.java.pageObjectsAndroid;

import org.openqa.selenium.WebElement;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.ConnectionDetailPage;

/**
 * The ConnectionDetailPageAndroid class is to hold webelement for ConnectionDetail Page for Android
 * 
 */
public class ConnectionDetailPageAndroid implements ConnectionDetailPage {

	
	public WebElement cross_Button(AppiumDriver driver) throws Exception {
		return null;
	}

	
	public WebElement continue_Button(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//*[@content-desc='invitation-success-continue']","Continue Button");
	}

}
