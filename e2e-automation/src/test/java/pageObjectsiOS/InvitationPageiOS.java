package test.java.pageObjectsiOS;

import org.openqa.selenium.WebElement;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.InvitationPage;

/**
 * The InvitationPageiOS class is to hold webelement for Invitation Page for iOS
 * 
 */
public class InvitationPageiOS implements InvitationPage  {

	public WebElement connect_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "(//XCUIElementTypeOther[@name='Connect'])[2]", "Connect Button");

	}

}
