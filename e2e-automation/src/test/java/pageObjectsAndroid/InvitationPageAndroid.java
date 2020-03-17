package test.java.pageObjectsAndroid;

import org.openqa.selenium.WebElement;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.InvitationPage;

/**
 * The InvitationPageAndroid class is to hold webelement for Invitation Page for Android
 * 
 */
public class InvitationPageAndroid implements InvitationPage  {

	
	public WebElement connect_Button(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//*[@content-desc='invitation-accept']","Connect Button");
	}

}
