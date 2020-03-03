package test.java.pageObjectsAndroid;

import io.appium.java_client.AppiumDriver;
import test.java.appModules.AppiumUtils;
import test.java.pageObjects.HomePage;

import org.openqa.selenium.WebElement;

/**
 * The HomePageAndroid class is to hold webelement for Home Page for Android 
 * 
 */
public class HomePageAndroid implements HomePage {

	
	public WebElement setting_Button(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return AppiumUtils.findElement(driver, "//*[@content-desc=\"Go to Settings\"]", "Setting button",2);
	}

	
	public WebElement connection_Bubble(AppiumDriver driver) throws Exception {
		return AppiumUtils.findElement(driver, "//XCUIElementTypeOther[contains(@content-desc,'bubble')]","Connection bubble");
	}

	
	public WebElement received_Status(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return null;
	}

	
	public WebElement user_Avatar(AppiumDriver driver) throws Exception {
		// TODO Auto-generated method stub
		return AppiumUtils.findElement(driver, "//android.view.ViewGroup[@content-desc=\"settings-user-avatar-label\"]/android.view.ViewGroup/android.widget.ImageView", "User Avtar");

	}

	
	public WebElement sovrinToken_Button(AppiumDriver driver) throws Exception {

		return AppiumUtils.findElement(driver, "//android.widget.TextView[@content-desc='home-sovrintoken-amount']", "Sovrin Token Button");
	}
	
}
